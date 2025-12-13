# Document Intelligence and Knowledge Search Hub - Backend

A Node.js/Express backend for a MERN stack application that enables users to upload documents, extract content, and ask AI-powered questions with document references.

## Features

- **User Authentication**: JWT-based login and signup
- **Document Management**: Upload PDF and text files with automatic text extraction
- **Vector Embeddings**: Generate embeddings for document chunks for semantic search
- **AI-Powered Q&A**: Answer questions based on uploaded documents using OpenAI GPT
- **Chat History**: Store and retrieve previous queries and answers
- **Document References**: Every answer includes relevant document excerpts

## Prerequisites

- Node.js v14 or higher
- MongoDB (local or Atlas cloud)
- OpenAI API key
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create a `.env` file** in the backend directory with the following variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/document-intelligence
JWT_SECRET=your_super_secret_jwt_key_change_this
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=5000
NODE_ENV=development
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db-name` |
| `JWT_SECRET` | Secret key for JWT token signing | Any random string |
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## Running the Server

### Development Mode
```bash
npm run dev
```
Uses nodemon for auto-reload on file changes.

### Production Mode
```bash
npm start
```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/signup`
Create a new user account
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGc..."
}
```

#### POST `/api/auth/login`
Login to existing account
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:** Same as signup with token

#### GET `/api/auth/me`
Get current user info (requires auth token)
**Headers:**
```
Authorization: Bearer {token}
```

---

### Document Routes (`/api/documents`)

#### POST `/api/documents/upload`
Upload a document (PDF or TXT)
- **Headers:** `Authorization: Bearer {token}`
- **Body:** Form-data with `file` field
- **File size limit:** 10MB

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": "...",
    "filename": "document.pdf",
    "status": "processing",
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET `/api/documents`
Get all documents for logged-in user
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "_id": "...",
    "filename": "document.pdf",
    "status": "completed",
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
]
```

#### GET `/api/documents/:id`
Get specific document
**Headers:** `Authorization: Bearer {token}`

#### DELETE `/api/documents/:id`
Delete a document
**Headers:** `Authorization: Bearer {token}`

---

### Chat Routes (`/api/chat`)

#### POST `/api/chat/ask`
Ask a question based on uploaded documents
**Headers:** `Authorization: Bearer {token}`
```json
{
  "question": "What are the main points in the document?"
}
```

**Response:**
```json
{
  "id": "...",
  "question": "What are the main points?",
  "answer": "The document discusses several key topics including...",
  "references": [
    {
      "documentId": "...",
      "documentName": "document.pdf",
      "excerpt": "The main points are...",
      "similarity": 0.92
    }
  ],
  "tokens_used": 150,
  "createdAt": "2024-01-15T10:35:00Z"
}
```

#### GET `/api/chat/history`
Get chat history for current user
**Headers:** `Authorization: Bearer {token}`

#### GET `/api/chat/:id`
Get specific chat entry
**Headers:** `Authorization: Bearer {token}`

#### DELETE `/api/chat/:id`
Delete a chat entry
**Headers:** `Authorization: Bearer {token}`

## Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection setup
├── middleware/
│   └── auth.js               # JWT authentication middleware
├── models/
│   ├── User.js               # User schema
│   ├── Document.js           # Document schema with embeddings
│   └── ChatHistory.js        # Chat history schema
├── routes/
│   ├── authRoutes.js         # Authentication endpoints
│   ├── docRoutes.js          # Document management endpoints
│   └── chatRoutes.js         # Q&A and chat endpoints
├── services/
│   ├── aiService.js          # OpenAI integration
│   ├── embeddingService.js   # Vector embedding logic
│   └── chunkService.js       # Text chunking and extraction
├── utils/
│   └── createVectorIndex.json # MongoDB vector index config
├── uploads/                  # Document storage (optional)
├── .env                      # Environment variables
├── package.json              # Dependencies
└── server.js                 # Main server file
```

## Key Services

### `aiService.js`
- `generateAnswer(question, relevantContent)` - Generates AI answers using OpenAI GPT-3.5-turbo

### `embeddingService.js`
- `getEmbedding(text)` - Generates vector embeddings for text
- `findSimilarChunks(questionEmbedding, documentChunks, topK)` - Finds semantically similar chunks
- `cosineSimilarity(vecA, vecB)` - Calculates cosine similarity between vectors

### `chunkService.js`
- `extractTextFromPDF(buffer)` - Extracts text from PDF files
- `extractTextFromTxt(buffer)` - Extracts text from plain text files
- `createChunks(text, chunkSize, overlap)` - Splits text into overlapping chunks
- `cleanText(text)` - Normalizes text whitespace

## Document Processing Flow

1. User uploads a PDF or TXT file
2. Text is extracted from the file
3. Text is split into chunks (500 chars with 100 char overlap by default)
4. Vector embeddings are generated for each chunk
5. Document status changes to "completed"
6. When user asks a question:
   - Question is converted to embedding
   - Most similar chunks are found using cosine similarity
   - Top 5 chunks are used as context
   - OpenAI GPT generates answer based on context
   - Answer and references are saved to chat history

## Known Limitations

1. **PDF Text Extraction**: Complex PDFs with images/scans may not extract perfectly
2. **Token Limits**: OpenAI API has token limits; very long documents may need pagination
3. **Real-time Processing**: Document embedding happens asynchronously; large files may take time
4. **Vector Storage**: Currently uses MongoDB arrays; for production with many documents, consider dedicated vector DB
5. **Context Window**: GPT-3.5-turbo has 4K token limit; very long context may be truncated

## Assumptions

1. Users have valid OpenAI API keys
2. MongoDB is accessible via the provided URI
3. Uploaded documents are in English
4. PDF files are text-based (not scanned images)
5. Document size doesn't exceed 10MB
6. Users have stable internet for API calls

## Security Considerations

1. **JWT Expiration**: Tokens expire after 7 days
2. **Password Hashing**: Passwords are hashed with bcryptjs (10 salt rounds)
3. **CORS**: Currently allows all origins (configure for production)
4. **Rate Limiting**: Not implemented (recommended for production)
5. **Input Validation**: Basic validation present (enhance for production)

## Development

### Adding New Routes
1. Create new file in `routes/`
2. Use `auth` middleware for protected routes
3. Import in `server.js` and attach to app

### Extending Models
1. Modify schema in `models/`
2. Add new fields with appropriate types
3. Update related services as needed

## Troubleshooting

**MongoDB Connection Error:**
- Verify `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

**OpenAI API Errors:**
- Verify API key is valid
- Check rate limits and quota
- Ensure sufficient API credits

**File Upload Issues:**
- Check file size (max 10MB)
- Verify file type is PDF or TXT
- Check multer middleware configuration

## Future Enhancements

- Support for more file formats (DOCX, PPT)
- Advanced search filters
- Collaboration/sharing features
- Document versioning
- Custom embedding models
- Rate limiting and usage analytics
- Support for multiple languages

## License

MIT

## Contact

For issues or questions, please create a GitHub issue or contact the development team.
