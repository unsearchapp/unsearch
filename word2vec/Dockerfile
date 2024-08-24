FROM python:3.9 as development

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV WORD2VEC_PORT=5001
ENV WORD2VEC_PORT=${WORD2VEC_PORT}

EXPOSE ${WORD2VEC_PORT}

# Set environment variable for development
ENV FLASK_ENV=development

CMD ["python", "app.py"]

# Production stage
FROM python:3.9 AS production

WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install gunicorn

# Copy the application code
COPY . .

# Expose the port for production
ENV WORD2VEC_PORT=5001
ENV WORD2VEC_PORT=${WORD2VEC_PORT}

EXPOSE ${WORD2VEC_PORT}

# Environment variable for production
ENV FLASK_ENV=production

# Command to run the app in production
CMD gunicorn --bind 0.0.0.0:${WORD2VEC_PORT} app:app