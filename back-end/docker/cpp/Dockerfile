FROM gcc:latest

RUN useradd -m judgeuser
USER judgeuser
WORKDIR /app

# The execution wrapper will mount the code to /app and run it.
