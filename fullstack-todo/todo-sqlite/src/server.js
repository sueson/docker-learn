import express from 'express';
import path, { dirname}  from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth-routes.js';
import todoRoutes from './routes/todo-routes.js';
import authMiddleware from './middleware/auth-middleware.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Get file path from the url of the current module...
const __filename = fileURLToPath(import.meta.url);

// Get the directory name from the file path...
const __dirname = dirname(__filename);

// Middleware...
app.use(express.json());

// Tells express to use all the files from public folder as static assets / file. Any css files will be resolved to public directory...
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

//Routes...
app.use('/auth', authRoutes);
app.use('/todos',authMiddleware, todoRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})