import joblib

# Paths to your models
EARLY_MODEL_PATH = r'C:/VS CODE/6th-mini/Autonomous-AI-Operations-Analyst-/backend/early_severity_model_v2.pkl'
FINAL_MODEL_PATH = r'C:/VS CODE/6th-mini/Autonomous-AI-Operations-Analyst-/backend/final_severity_model_v2.pkl'

# Load models
early_model = joblib.load(EARLY_MODEL_PATH)
final_model = joblib.load(FINAL_MODEL_PATH)

print('Early Severity Model:')
print('Type:', type(early_model))
if hasattr(early_model, 'get_params'):
    print('Params:', early_model.get_params())
if hasattr(early_model, 'feature_names_in_'):
    print('Features:', early_model.feature_names_in_)
if hasattr(early_model, 'classes_'):
    print('Classes:', early_model.classes_)

print('\nFinal Severity Model:')
print('Type:', type(final_model))
if hasattr(final_model, 'get_params'):
    print('Params:', final_model.get_params())
if hasattr(final_model, 'feature_names_in_'):
    print('Features:', final_model.feature_names_in_)
if hasattr(final_model, 'classes_'):
    print('Classes:', final_model.classes_)
