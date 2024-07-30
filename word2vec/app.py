import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from gensim.models import KeyedVectors
import numpy as np

app = Flask(__name__)
CORS(app)

model_path = 'GoogleNews-vectors-negative300.bin.gz'
model = None
if not os.path.exists(model_path):
  print(f"Pretrained model not found at {model_path}")
else:
  model = KeyedVectors.load_word2vec_format(model_path, binary=True)

def serialize_model_output(output):
  # Convert numpy types to native Python types for JSON serialization
  if isinstance(output, np.ndarray):
    return output.tolist()
  if isinstance(output, dict):
    return {key: serialize_model_output(value) for key, value in output.items()}
  return output

@app.route('/similarity', methods=['GET'])
def similarity():
  query = request.args.get('query')

  if not query:
    return jsonify({'error': 'Query is required'}), 400

  tokens = query.split()
  if not tokens:
    return jsonify({'error': 'Query must contain at least one token'}), 400

  if not model: # Model isn't loaded
    return jsonify([[query, 1.0]])
    
  try:
    query_vector = model[tokens[0]]

    for token in tokens[1:]:
      query_vector += model[token]

    similar_words = model.most_similar([query_vector], topn=10)

    result = serialize_model_output(similar_words)
    return jsonify(result)
  except KeyError as e:
    return jsonify([[query, 1.0]]) # Query not found in embeddings
  except Exception as e:
    return jsonify([[query, 1.0]])


if __name__ == '__main__':
  # Ensure the environment is set to development
  os.environ['FLASK_ENV'] = 'development'
  os.environ['FLASK_DEBUG'] = '1'

  app.run(debug=True, host='0.0.0.0', port=os.environ.get("WORD2VEC_PORT"))
