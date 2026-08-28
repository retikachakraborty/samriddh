"""Idempotent Phase 1 ETL for Samriddh.

Raw files are read only. Every output is recreated under data/processed and
data/quality. The implementation intentionally uses the Python standard library
so the pipeline can run in a clean environment.
"""
from __future__ import annotations

import csv, json, math, random, shutil, statistics, zipfile
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"
QUALITY = ROOT / "data" / "quality"

def read_csv(path):
    with path.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))

def write_csv(path, rows, fields=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = list(rows)
    if fields is None: fields = list(rows[0]) if rows else []
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader(); w.writerows(rows)

def num(v, default=0.0):
    try: return float(v) if v not in (None, "") else default
    except (ValueError, TypeError): return default

def xlsx_rows(path):
    """Read the simple shared-string worksheet used by UCI Online Retail."""
    with zipfile.ZipFile(path) as z:
        shared=[]
        if "xl/sharedStrings.xml" in z.namelist():
            root=ET.fromstring(z.read("xl/sharedStrings.xml"))
            ns={"x":"http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
            for si in root.findall("x:si", ns):
                shared.append("".join(t.text or "" for t in si.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")))
        sheet=z.read("xl/worksheets/sheet1.xml")
    root=ET.fromstring(sheet); ns="{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
    rows=[]
    for row in root.iter(ns+"row"):
        vals=[]; last=0
        for c in row.findall(ns+"c"):
            ref=c.attrib.get("r", "A1"); col=0
            for ch in ''.join(x for x in ref if x.isalpha()): col=col*26+ord(ch.upper())-64
            while len(vals)<col: vals.append("")
            v=c.find(ns+"v"); value="" if v is None else (v.text or "")
            if c.attrib.get("t")=="s" and value: value=shared[int(value)]
            vals[col-1]=value; last=col
        rows.append(vals[:last])
    return rows

def parse_excel():
    rows=xlsx_rows(RAW/"transactions"/"Online Retail.xlsx")
    header=[str(x).strip() for x in rows[0]]
    records=[dict(zip(header, r+([""]*(len(header)-len(r))))) for r in rows[1:]]
    # The UCI workbook stores InvoiceDate as an Excel serial date.  Normalise it
    # here so all downstream time calculations use one explicit representation.
    for record in records:
        parsed=parse_date(record.get("InvoiceDate", ""))
        if parsed:
            record["InvoiceDate"]=parsed.strftime("%m/%d/%Y %H:%M")
    return records, header

def parse_date(value):
    try:
        return datetime(1899, 12, 30) + timedelta(days=float(value))
    except (ValueError, TypeError):
        pass
    for pattern in ("%m/%d/%Y %H:%M", "%Y-%m-%d %H:%M:%S"):
        try: return datetime.strptime(value, pattern)
        except ValueError: pass
    return None

def transaction_etl():
    raw, original_fields=parse_excel()
    exact=Counter(tuple(r.get(k,"") for k in original_fields) for r in raw)
    dedup=[]; seen=set()
    for r in raw:
        key=tuple(r.get(k,"") for k in original_fields)
        if key not in seen: dedup.append(r); seen.add(key)
    desc_by_stock={}
    for r in dedup:
        d=(r.get("Description") or "").strip(); s=r.get("StockCode","").strip()
        if d and s and not d.lower().startswith("missing"): desc_by_stock.setdefault(s, Counter())[d]+=1
    out=[]; recovered=unrecoverable=0
    for r in dedup:
        q=num(r.get("Quantity")); price=num(r.get("UnitPrice")); invoice=str(r.get("InvoiceNo","")).strip()
        desc=(r.get("Description") or "").strip(); stock=r.get("StockCode","").strip()
        if not desc:
            choices=desc_by_stock.get(stock, Counter())
            # Only use a StockCode mapping when it identifies one description.
            # Choosing the most common label for an ambiguous code would invent
            # a product description rather than safely recovering one.
            if choices and len(choices) == 1:
                desc=choices.most_common(1)[0][0]; recovered+=1
            else: unrecoverable+=1
        dt=parse_date(r.get("InvoiceDate", ""))
        is_adj=price<0 or stock.upper()=="B" or "bad debt" in desc.lower()
        is_cancel=invoice.upper().startswith("C")
        is_return=q<0 and not is_cancel and not is_adj
        if is_adj: typ="ADJUSTMENT"
        elif is_cancel: typ="CANCELLATION"
        elif is_return: typ="RETURN"
        elif q>0: typ="SALE"
        else: typ="OTHER"
        d=dict(r); d.update({"Description":desc, "CustomerID": r.get("CustomerID") or "",
            "line_value":round(q*price,4), "absolute_line_value":round(abs(q*price),4), "transaction_type":typ,
            "is_return":int(is_return), "is_cancellation":int(is_cancel), "is_adjustment":int(is_adj),
            "is_zero_price":int(price==0), "is_extreme_quantity":int(abs(q)>=1000), "customer_available":int(bool(r.get("CustomerID"))),
            "year":dt.year if dt else "", "month":dt.month if dt else "", "day":dt.day if dt else "",
            "day_of_week":dt.strftime("%A") if dt else "", "quarter":((dt.month-1)//3+1) if dt else ""})
        out.append(d)
    fields=original_fields+ ["line_value","absolute_line_value","transaction_type","is_return","is_cancellation","is_adjustment","is_zero_price","is_extreme_quantity","customer_available","year","month","day","day_of_week","quarter"]
    write_csv(PROCESSED/"transactions"/"transactions_cleaned.csv",out,fields)
    write_csv(PROCESSED/"transactions"/"customer_transactions.csv",[r for r in out if r["customer_available"] and r["transaction_type"] != "ADJUSTMENT"],fields)
    write_csv(PROCESSED/"transactions"/"returns_cancellations.csv",[r for r in out if r["is_return"] or r["is_cancellation"]],fields)
    # Reusable customer metrics: positive sales only, excluding adjustments.
    by=defaultdict(list)
    for r in out:
        if r["customer_available"] and r["transaction_type"] in ("SALE","RETURN", "CANCELLATION"):
            by[r["CustomerID"]].append(r)
    now=max((datetime.strptime(r["InvoiceDate"], "%m/%d/%Y %H:%M") for r in out if r["InvoiceDate"]), default=datetime.now())
    customers=[]
    for cid, rs in by.items():
        invoices={r["InvoiceNo"] for r in rs}; spend=sum(num(r["line_value"]) for r in rs); positive=sum(1 for r in invoices if not str(r).startswith("C"))
        dates=[datetime.strptime(r["InvoiceDate"], "%m/%d/%Y %H:%M") for r in rs]
        first=min(dates); last=max(dates)
        rec=(now-last).days
        customers.append({"customer_id":cid,"country":Counter(r["Country"] for r in rs).most_common(1)[0][0],"total_spend":round(spend,2),"order_count":positive,"units_purchased":sum(num(r["Quantity"]) for r in rs if num(r["Quantity"])>0),"average_order_value":round(spend/positive,2) if positive else 0,"first_purchase":first.strftime("%Y-%m-%d %H:%M"),"last_purchase":last.strftime("%Y-%m-%d %H:%M"),"recency":rec,"frequency":positive,"monetary_value":round(spend,2)})
    # Quintile-like RFM scoring, deterministic and explainable.
    def score(value, values, reverse=False):
        rank=sum(v<=value for v in values)/max(len(values),1); s=min(5,max(1,math.ceil(rank*5)))
        return 6-s if reverse else s
    recs=[x["recency"] for x in customers]; freqs=[x["frequency"] for x in customers]; mons=[x["monetary_value"] for x in customers]
    for c in customers:
        rs=score(c["recency"],recs,True); fs=score(c["frequency"],freqs); ms=score(c["monetary_value"],mons); total=rs+fs+ms
        if total>=13: seg="Champions"
        elif total>=10: seg="Loyal customers"
        elif rs<=2 and ms>=4: seg="At-risk high value"
        elif rs<=2: seg="Inactive"
        else: seg="Growing customers"
        c.update({"r_score":rs,"f_score":fs,"m_score":ms,"rfm_score":f"{rs}{fs}{ms}","rfm_segment":seg,"retention_action":"Personal outreach + tailored offer" if seg=="At-risk high value" else ("Win-back campaign" if seg=="Inactive" else "Nurture and recommend next purchase")})
    write_csv(PROCESSED/"transactions"/"customers.csv",customers)
    product_metrics(out); country_metrics(out)
    classification_counts=dict(Counter(r["transaction_type"] for r in out))
    quality={"source":"UCI Online Retail","input_rows":len(raw),"output_rows":len(out),"rows_removed":{"exact_duplicate_rows":len(raw)-len(dedup)},"missing_descriptions":{"recovered_from_unambiguous_stock_code":recovered,"unrecoverable":unrecoverable},"rows_used_for_customer_analytics":sum(r["customer_available"] and r["transaction_type"] != "ADJUSTMENT" for r in out),"sales_returns_cancellation_treatment":{"sales":classification_counts.get("SALE",0),"returns":classification_counts.get("RETURN",0),"cancellations":classification_counts.get("CANCELLATION",0),"excluded_adjustments":classification_counts.get("ADJUSTMENT",0)},"missing_customer_rows_retained_for_general_analytics":sum(not r["CustomerID"] for r in out),"extreme_quantity_rows":sum(int(r["is_extreme_quantity"]) for r in out),"zero_price_rows":sum(int(r["is_zero_price"]) for r in out),"negative_unit_price_rows":sum(num(r["UnitPrice"])<0 for r in out)}
    return quality

def product_metrics(rows):
    by=defaultdict(list)
    for r in rows:
        by[r["StockCode"]].append(r)
    out=[]
    for code,rs in by.items():
        desc=Counter(r["Description"] for r in rs if r["Description"]).most_common(1)
        desc=desc[0][0] if desc else ""
        sales=sum(num(r["line_value"]) for r in rs if r["transaction_type"]=="SALE")
        qty=sum(num(r["Quantity"]) for r in rs if r["transaction_type"]=="SALE")
        ret=sum(abs(num(r["Quantity"])) for r in rs if r["is_return"] or r["is_cancellation"])
        out.append({"stock_code":code,"description":desc,"revenue":round(sales,2),"quantity_sold":int(qty),"order_frequency":len({r["InvoiceNo"] for r in rs}),"return_quantity":int(ret),"return_rate":round(ret/max(qty,1),4),"country":Counter(r["Country"] for r in rs).most_common(1)[0][0]})
    write_csv(PROCESSED/"transactions"/"product_metrics.csv",sorted(out,key=lambda x:x["revenue"],reverse=True))
def country_metrics(rows):
    by=defaultdict(list)
    for r in rows: by[r["Country"]].append(r)
    out=[]
    for country,rs in by.items():
        out.append({"country":country,"revenue":round(sum(num(r["line_value"]) for r in rs if r["transaction_type"]=="SALE"),2),"order_count":len({r["InvoiceNo"] for r in rs if r["transaction_type"]=="SALE"}),"customer_count":len({r["CustomerID"] for r in rs if r["CustomerID"]}),"return_rate":round(sum(abs(num(r["Quantity"])) for r in rs if r["is_return"])/max(sum(num(r["Quantity"]) for r in rs if r["transaction_type"]=="SALE"),1),4)})
    write_csv(PROCESSED/"transactions"/"country_metrics.csv",sorted(out,key=lambda x:x["revenue"],reverse=True))

def review_etl():
    reviews=read_csv(RAW/"reviews"/"reviews.csv"); products=read_csv(RAW/"reviews"/"products.csv"); sellers=read_csv(RAW/"reviews"/"sellers.csv"); labels=read_csv(RAW/"reviews"/"sentiment_labels.csv"); trends=read_csv(RAW/"reviews"/"monthly_trends.csv")
    pmap={r["product_id"]:r for r in products}; smap={r["seller_id"]:r for r in sellers}; lmap={r["review_id"]:r for r in labels}; enriched=[]
    for r in reviews:
        p=pmap.get(r["product_id"],{}); l=lmap.get(r["review_id"],{}); s=smap.get(p.get("seller_id"),{})
        x=dict(r); x.update({"seller_id":p.get("seller_id",""),"seller_fake_rate":s.get("fake_rate",""),"sentiment_score":l.get("sentiment_score",""),"quality_aspect":l.get("quality_aspect",""),"shipping_aspect":l.get("shipping_aspect",""),"value_aspect":l.get("value_aspect",""),"service_aspect":l.get("service_aspect",""),"emotion":l.get("emotion","")})
        enriched.append(x)
    write_csv(PROCESSED/"reviews"/"reviews_enriched.csv",enriched)
    write_csv(PROCESSED/"reviews"/"review_trends.csv",trends)
    by=defaultdict(list)
    for r in enriched: by[r["product_id"]].append(r)
    metrics=[]
    for pid,rs in by.items():
        metrics.append({"product_id":pid,"category":rs[0].get("category",""),"review_count":len(rs),"average_rating":round(statistics.mean(num(r["star_rating"]) for r in rs),2),"positive_pct":round(sum(r["sentiment"]=="positive" for r in rs)/len(rs),4),"negative_pct":round(sum(r["sentiment"]=="negative" for r in rs)/len(rs),4),"fake_rate":round(sum(num(r["is_fake_review"]) for r in rs)/len(rs),4),"verified_pct":round(sum(num(r["verified_purchase"]) for r in rs)/len(rs),4),"helpful_ratio":round(statistics.mean(num(r["helpful_ratio"]) for r in rs),4)})
    write_csv(PROCESSED/"reviews"/"product_review_metrics.csv",metrics)
    write_csv(PROCESSED/"reviews"/"products.csv",products); write_csv(PROCESSED/"reviews"/"sellers.csv",sellers)
    quality={"source":"E-commerce Customer Reviews","reviews":len(reviews),"products":len(products),"sellers":len(sellers),"sentiment_records":len(labels),"trend_periods":len(trends),"relationship_missing":{"review_product":sum(r["product_id"] not in pmap for r in reviews),"review_sentiment":sum(r["review_id"] not in lmap for r in reviews),"product_seller":sum(r["seller_id"] not in smap for r in products)}}
    return quality

def main():
    for d in (PROCESSED/"transactions",PROCESSED/"reviews",QUALITY): d.mkdir(parents=True,exist_ok=True)
    tq=transaction_etl(); rq=review_etl()
    report={"generated_at":datetime.utcnow().isoformat()+"Z","transactions":tq,"reviews":rq}
    (QUALITY/"data_quality.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps(report,indent=2))

if __name__=="__main__": main()
