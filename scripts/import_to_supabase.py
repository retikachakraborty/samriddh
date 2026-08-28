import csv
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SECRET_KEY"],
)

BATCH = 500


def read_csv(path):
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def chunks(rows):
    for i in range(0, len(rows), BATCH):
        yield rows[i:i + BATCH]


def value(v):
    return None if v == "" else v


def num(v):
    return None if v == "" else float(v)


def integer(v):
    return None if v == "" else int(float(v))


def boolean(v):
    return v == "1"


def upload(table, path, transform, *, on_conflict=None):
    print(f"\n=== {table} ===")

    rows = read_csv(path)
    total = len(rows)

    for start in range(0, total, BATCH):
        batch = [transform(r, start + offset + 1) if on_conflict else transform(r)
                 for offset, r in enumerate(rows[start:start + BATCH])]

        for attempt in range(3):
            try:
                request = supabase.table(table).upsert(batch, returning="minimal")
                if on_conflict:
                    request = supabase.table(table).upsert(
                        batch, on_conflict=on_conflict, returning="minimal"
                    )
                request.execute()
                break
            except Exception as e:
                if attempt == 2:
                    raise
                print(f"\nRetrying batch {start:,}: {e}")
                time.sleep(2)

        done = min(start + BATCH, total)
        print(f"\r{done:,}/{total:,}", end="", flush=True)

    print(f"\n✓ {table}: {total:,}")


def customer(r):
    return {
        "customer_id": value(r["customer_id"]),
        "country": value(r["country"]),
        "total_spend": num(r["total_spend"]),
        "order_count": integer(r["order_count"]),
        "units_purchased": num(r["units_purchased"]),
        "average_order_value": num(r["average_order_value"]),
        "first_purchase": value(r["first_purchase"]),
        "last_purchase": value(r["last_purchase"]),
        "recency": integer(r["recency"]),
        "frequency": integer(r["frequency"]),
        "monetary_value": num(r["monetary_value"]),
        "r_score": integer(r["r_score"]),
        "f_score": integer(r["f_score"]),
        "m_score": integer(r["m_score"]),
        "rfm_score": value(r["rfm_score"]),
        "rfm_segment": value(r["rfm_segment"]),
        "retention_action": value(r["retention_action"]),
    }


def product(r):
    return {
        "stock_code": value(r["stock_code"]),
        "description": value(r["description"]),
        "revenue": num(r["revenue"]),
        "quantity_sold": integer(r["quantity_sold"]),
        "order_frequency": integer(r["order_frequency"]),
        "return_quantity": integer(r["return_quantity"]),
        "return_rate": num(r["return_rate"]),
        "country": value(r["country"]),
    }


def transaction(r, source_row_number=None):
    return {
        "source_row_number": source_row_number,
        "invoice_no": value(r["InvoiceNo"]),
        "stock_code": value(r["StockCode"]),
        "description": value(r["Description"]),
        "quantity": num(r["Quantity"]),
        "invoice_date": value(r["InvoiceDate"]),
        "unit_price": num(r["UnitPrice"]),
        "customer_id": value(r["CustomerID"]),
        "country": value(r["Country"]),
        "line_value": num(r["line_value"]),
        "absolute_line_value": num(r["absolute_line_value"]),
        "transaction_type": value(r["transaction_type"]),
        "is_return": boolean(r["is_return"]),
        "is_cancellation": boolean(r["is_cancellation"]),
        "is_adjustment": boolean(r["is_adjustment"]),
        "is_zero_price": boolean(r["is_zero_price"]),
        "is_extreme_quantity": boolean(r["is_extreme_quantity"]),
        "customer_available": boolean(r["customer_available"]),
        "year": integer(r["year"]),
        "month": integer(r["month"]),
        "day": integer(r["day"]),
        "day_of_week": value(r["day_of_week"]),
        "quarter": integer(r["quarter"]),
    }


def country(r):
    return {
        "country": value(r["country"]),
        "revenue": num(r["revenue"]),
        "order_count": integer(r["order_count"]),
        "customer_count": integer(r["customer_count"]),
        "return_rate": num(r["return_rate"]),
    }


def review_product(r):
    return {
        "product_id": value(r["product_id"]),
        "category": value(r["category"]),
        "price_usd": num(r["price_usd"]),
        "true_quality": num(r["true_quality"]),
        "seller_id": value(r["seller_id"]),
        "is_prime": value(r["is_prime"]) == "1",
        "num_images": integer(r["num_images"]),
        "bullet_points": integer(r["bullet_points"]),
        "has_video": value(r["has_video"]) == "1",
        "brand_tier": value(r["brand_tier"]),
        "days_on_platform": integer(r["days_on_platform"]),
        "total_reviews": integer(r["total_reviews"]),
        "avg_rating": num(r["avg_rating"]),
    }


def seller(r):
    return {
        "seller_id": value(r["seller_id"]),
        "seller_name": None,
        "fake_rate": num(r["fake_rate"]),
    }


def review(r):
    return {
        "review_id": value(r["review_id"]),
        "product_id": value(r["product_id"]),
        "user_id": value(r["user_id"]),
        "review_date": value(r["review_date"]),
        "year": integer(r["year"]),
        "month": integer(r["month"]),
        "star_rating": num(r["star_rating"]),
        "sentiment": value(r["sentiment"]),
        "verified_purchase": value(r["verified_purchase"]) == "1",
        "is_fake_review": value(r["is_fake_review"]) == "1",
        "review_length_words": integer(r["review_length_words"]),
        "has_title": value(r["has_title"]) == "1",
        "title_word_count": integer(r["title_word_count"]),
        "num_images_attached": integer(r["num_images_attached"]),
        "helpful_votes": integer(r["helpful_votes"]),
        "total_votes": integer(r["total_votes"]),
        "helpful_ratio": num(r["helpful_ratio"]),
        "days_since_purchase": integer(r["days_since_purchase"]),
        "reviewer_review_count": integer(r["reviewer_review_count"]),
        "is_top_reviewer": value(r["is_top_reviewer"]) == "1",
        "is_early_review": value(r["is_early_review"]) == "1",
        "exclamation_marks": integer(r["exclamation_marks"]),
        "all_caps_ratio": num(r["all_caps_ratio"]),
        "readability_score": num(r["readability_score"]),
        "category": value(r["category"]),
        "price_usd": num(r["price_usd"]),
        "price_tier": value(r["price_tier"]),
        "brand_tier": value(r["brand_tier"]),
        "seller_id": value(r["seller_id"]),
        "seller_fake_rate": num(r["seller_fake_rate"]),
        "sentiment_score": num(r["sentiment_score"]),
        "quality_aspect": value(r["quality_aspect"]),
        "shipping_aspect": value(r["shipping_aspect"]),
        "value_aspect": value(r["value_aspect"]),
        "service_aspect": value(r["service_aspect"]),
        "emotion": value(r["emotion"]),
    }


def trend(r):
    period = value(r["period"])
    year, month = period.split("-")

    return {
        "year": int(year),
        "month": int(month),
        "month_label": period,
        "review_count": integer(r["review_count"]),
        "average_rating": float(r["avg_rating"]),
        "positive_pct": float(r["pct_positive"]),
        "negative_pct": float(r["pct_negative"]),
    }

def review_metric(r):
    return {
        "product_id": value(r["product_id"]),
        "category": value(r["category"]),
        "review_count": integer(r["review_count"]),
        "average_rating": num(r["average_rating"]),
        "positive_pct": num(r["positive_pct"]),
        "negative_pct": num(r["negative_pct"]),
        "fake_rate": num(r["fake_rate"]),
        "verified_pct": num(r["verified_pct"]),
        "helpful_ratio": num(r["helpful_ratio"]),
    }


def main():
    tx = ROOT / "data/processed/transactions"
    rv = ROOT / "data/processed/reviews"

    transactions_only = "--transactions-only" in sys.argv

    if transactions_only:
        upload("transactions", tx / "transactions_cleaned.csv", transaction,
               on_conflict="source_row_number")
        return

    # Retail parent tables
    upload("customers", tx / "customers.csv", customer)
    upload("products", tx / "product_metrics.csv", product)
    upload("country_metrics", tx / "country_metrics.csv", country)

    # Retail child table
    upload("transactions", tx / "transactions_cleaned.csv", transaction,
           on_conflict="source_row_number")

    # Review parent tables
    upload("review_products", rv / "products.csv", review_product)
    upload("sellers", rv / "sellers.csv", seller)

    # Review child tables
    upload("reviews", rv / "reviews_enriched.csv", review)
    upload("review_trends", rv / "review_trends.csv", trend)
    upload(
        "product_review_metrics",
        rv / "product_review_metrics.csv",
        review_metric,
    )

    print("\n================================")
    print("SAMRIDDH DATA IMPORT COMPLETE")
    print("================================")


if __name__ == "__main__":
    main()
