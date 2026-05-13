from fastapi import APIRouter
from services.predictor import predict_log

router = APIRouter()

@router.post("/predict")
def predict(data: dict):
    log = data.get("log", "")
    return predict_log(log)