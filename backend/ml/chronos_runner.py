"""
Chronos-2 Local Forecasting Engine Runner
Feature 01: Volume Forecasting

This module initializes the Amazon Chronos time series forecasting model locally
and produces predictions for Inbound, Outbound, and Inventory volumes.
No confidential data is sent to external LLM APIs (Gemini, NVIDIA, OpenRouter, etc.).
"""

import sys
import json
import os
import torch
from chronos import ChronosPipeline

# Global singleton pipeline
_pipeline = None

def get_device():
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"

def load_chronos_model():
    global _pipeline
    if _pipeline is None:
        device = get_device()
        # Initialize Chronos pipeline locally
        _pipeline = ChronosPipeline.from_pretrained(
            "amazon/chronos-t5-tiny",
            device_map=device,
            dtype=torch.float32
        )
    return _pipeline

def predict_single_series(pipeline, history_values, horizon, num_samples=20):
    if not history_values or len(history_values) == 0:
        raise ValueError("Historical series is empty.")
    
    context = torch.tensor(history_values, dtype=torch.float32)
    # Predict future distribution
    forecast = pipeline.predict(context, prediction_length=horizon, num_samples=num_samples)
    # Use median (50th percentile) as the point forecast
    median_forecast = torch.median(forecast[0], dim=0).values.tolist()
    # Round to realistic integers (>= 0)
    return [max(0, int(round(val))) for val in median_forecast]

def run_forecast(request_data):
    try:
        horizon = int(request_data.get("horizon", 0))
        if horizon <= 0:
            return {"success": False, "error": f"Invalid forecast horizon ({horizon}). Must be > 0."}
        
        series_data = request_data.get("series", {})
        inbound_history = series_data.get("inbound", [])
        outbound_history = series_data.get("outbound", [])
        inventory_history = series_data.get("inventory", [])

        if not inbound_history or not outbound_history or not inventory_history:
            return {"success": False, "error": "Missing historical data series for inbound, outbound, or inventory."}

        pipeline = load_chronos_model()

        inbound_preds = predict_single_series(pipeline, inbound_history, horizon)
        outbound_preds = predict_single_series(pipeline, outbound_history, horizon)
        inventory_preds = predict_single_series(pipeline, inventory_history, horizon)

        return {
            "success": True,
            "model": "Chronos-2",
            "device": get_device(),
            "horizon": horizon,
            "predictions": {
                "inbound": inbound_preds,
                "outbound": outbound_preds,
                "inventory": inventory_preds
            }
        }
    except Exception as e:
        return {"success": False, "error": f"Chronos-2 inference failed: {str(e)}"}

def main():
    # If run in stdio interactive mode
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        try:
            load_chronos_model()
            print(json.dumps({"success": True, "model": "Chronos-2", "status": "ready", "device": get_device()}))
            sys.stdout.flush()
            return
        except Exception as e:
            print(json.dumps({"success": False, "error": str(e)}))
            sys.stdout.flush()
            return

    # Interactive stdio loop
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            res = run_forecast(req)
            print(json.dumps(res))
            sys.stdout.flush()
        except Exception as e:
            print(json.dumps({"success": False, "error": f"Invalid JSON or execution error: {str(e)}"}))
            sys.stdout.flush()

if __name__ == "__main__":
    main()
