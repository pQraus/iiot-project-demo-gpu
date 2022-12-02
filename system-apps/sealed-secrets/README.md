# Sealed Secret System App

openssl req -x509 -nodes -newkey rsa:4096 -keyout private_key -out cert -subj "/CN=sealed-secret/O=sealed-secret"