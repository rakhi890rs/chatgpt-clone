# Security Policy

## Overview

This document defines the security practices, supported versions, and vulnerability reporting process for this project.

This system includes:
- Secure authentication system (JWT + cookies)
- Backend API protection
- AI-based Retrieval-Augmented Generation (RAG)
- Vector database usage via **Pinecone**
- Secure user data handling

We follow strong security practices to ensure data safety, privacy, and system integrity.

---

## Supported Versions

Only the latest version of this project is actively maintained with security updates.

| Version | Supported |
|-----------|-------------|
| Latest Release | ✅ Yes |
| Older Versions | ❌ No |

---

## Security Architecture

### 🔐 Authentication & Authorization
- JWT-based authentication
- httpOnly secure cookies
- Password hashing using **bcrypt**
- Protected API routes using middleware

### 🔑 Password Security
- Strong hashing using bcrypt
- Salted hashes
- No plaintext password storage
- Enforced secure password handling

### 🌐 API & Backend Security
- Secure CORS configuration
- Input validation and sanitization
- Centralized error handling
- Secure environment variable handling
- MongoDB security best practices

---

## 🤖 AI + RAG + Pinecone Security

This project uses **Retrieval-Augmented Generation (RAG)** with **Pinecone vector database** for semantic search and AI responses.

### 🔒 Vector Database Security
- Pinecone API keys stored securely in `.env`
- No API keys exposed in frontend
- Secure server-side embedding and retrieval pipeline
- Access limited via backend-only API calls

### 🧠 AI Data Safety
- No raw sensitive user data is directly sent to LLMs
- User inputs sanitized before embedding
- Controlled prompt generation
- Context filtering to avoid leakage of private data

### 📦 Embedding Pipeline Security
- Secure vector upserts
- Controlled similarity queries
- Namespace separation for dataset isolation
- Metadata sanitization

---

## 🛡️ Infrastructure & Secrets Management

- Environment variables for secrets
- `.env` excluded using `.gitignore`
- JWT secrets stored securely
- Pinecone + OpenAI keys protected
- Database credentials hidden

---

## Reporting a Vulnerability

We strongly encourage responsible disclosure.

### 📩 Contact

Report security issues via:

**Email:** rakhisingh876.com@gmail.com  

or create a **GitHub private security advisory**.

---

### 📝 What to Include

- Detailed vulnerability description
- Steps to reproduce
- Possible impact
- Proof of concept or logs

---

## Response Timeline

- Initial response: **24–48 hours**
- Investigation: **≤ 3 days**
- Patch / fix: **3–7 days** depending on severity

Critical issues are prioritized.

---

## Responsible Disclosure Guidelines

Please:
- Do not publicly disclose before fix
- Avoid exploiting vulnerabilities
- Allow sufficient time for mitigation

All valid reporters will receive full credit.

---

## Security Best Practices for Contributors

- Never commit `.env` files
- Do not expose API keys
- Use secure authentication flows
- Sanitize all user input
- Follow OWASP security guidelines

---

## Acknowledgements

We appreciate all contributors and security researchers who help maintain system integrity and safety.

Thank you for supporting ethical and responsible security research 🙌
