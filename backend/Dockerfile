# If the Dockerfile is in the backend directory
FROM golang:1.24-alpine

WORKDIR /app

# Copy the go.mod and go.sum from the parent directory
COPY ../go.mod ../go.sum ./
RUN go mod download

# Copy the rest of the backend source code
COPY . .

# The `cmd` directory is now directly in /app
RUN go build -o server ./cmd

EXPOSE 8080

CMD ["./server"]