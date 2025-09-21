# Meesho Seller Support System (MSSS)

A web application for sellers to upload product photos, invoke a local LangGraph pipeline, and see the final approved image with analysis. Built with Meesho supplier UI styling.

## Features

- **Image Upload**: Drag & drop up to 6 product images
- **AI Analysis**: LangGraph pipeline for relevance, quality, and reality checks
- **Smart Routing**: Three processing routes (A/B/C) for optimal results
- **History Tracking**: View past analysis runs and results
- **Meesho UI**: Beautiful interface matching Meesho supplier panel design

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Local API routes that spawn Python CLI
- **AI Pipeline**: LangGraph with Gemini AI integration
- **Storage**: Local uploads/outputs, SQLite for history

## Quick Start

### Prerequisites

1. **Python Environment**
   ```bash
   pip install langgraph google-generativeai pillow requests sqlite3
   ```

2. **Node.js** (Latest LTS version recommended)

### Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd meesho-seller-support
   npm install
   ```

2. **Environment Configuration**
   Create `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PY_CMD=python
   PY_ENTRY=./main.py
   PORT=3000
   ```

3. **Python Pipeline**
   The `main.py` file is already included in the project root. Ensure your Python environment has the required dependencies installed.

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Usage

### Image Assistant (/assistant)

1. **Upload Images**: Drag and drop up to 6 product images (JPG, PNG, WebP)
2. **Set Product Info**: Enter Product ID and select category
3. **Configure Options**: Toggle "Allow On-Model" for apparel items
4. **Run Analysis**: Click "Run Analysis" to process images
5. **Review Results**: View final selected image, scores, and analysis

### Processing Routes

- **Route A**: Original image selected (high quality, already optimized)
- **Route B**: AI-enhanced version (lighting, color, quality improvements)
- **Route C**: AI-generated image (completely new presentation)

### History (/history)

- View past analysis runs
- Download final images
- Track success rates and scores
- Filter by Product ID or Run ID

### Settings (/settings)

- Set default category and preferences
- View environment status
- Configure notifications and auto-save

## Architecture

### Frontend Structure
```
src/
├── components/
│   ├── layout/          # Sidebar, main layout
│   ├── assistant/       # Upload, forms, analysis components
│   └── ui/             # shadcn UI components
├── pages/              # Main application pages
├── hooks/              # Custom React hooks
└── lib/                # Utilities and helpers
```

### API Routes
- `POST /api/run` - Process images through Python pipeline
- `GET /api/history` - Fetch analysis history
- `GET /api/history/:id` - Get specific run details

### Python Integration

The system spawns the Python CLI with this flow:
```bash
python main.py --input payload.json
```

Where `payload.json` contains:
```json
{
  "product_id": "P123",
  "category": "apparel_top", 
  "images": [{"b64": "base64data"}],
  "meta": {"allow_wear": true}
}
```

## Development

### Adding New Features

1. **New Page**: Add route in `App.tsx`, create page component
2. **New Component**: Follow existing patterns in `components/`
3. **Styling**: Use design system tokens from `index.css`
4. **API**: Add routes as needed for Python integration

### Design System

Colors are defined in HSL format in `src/index.css`:
- Primary: `#9F2089` (Meesho brand)
- Success: `#0BA678`
- Warning: `#F59E0B`
- Destructive: `#DC2626`

All components use semantic tokens rather than direct colors.

## Deployment

1. **Build Production**
   ```bash
   npm run build
   ```

2. **Environment Setup**
   - Ensure Python environment is available
   - Set `GEMINI_API_KEY` in production
   - Configure file permissions for uploads/outputs

3. **Start Production**
   ```bash
   npm start
   ```

## Troubleshooting

### Common Issues

1. **Python Pipeline Fails**
   - Check `GEMINI_API_KEY` is set
   - Verify Python dependencies installed
   - Check `main.py` file permissions

2. **Image Upload Issues**
   - Ensure upload directory is writable
   - Check file size limits (5MB per file)
   - Verify supported formats (JPG, PNG, WebP)

3. **Database Issues**
   - SQLite file permissions
   - Check `catalog.sqlite` exists and is writable

### Environment Validation

Visit Settings page to check:
- ✅ Gemini API Key status
- ✅ Python pipeline availability  
- ✅ Database connection

## Contributing

1. Follow existing code patterns
2. Use TypeScript for type safety
3. Follow design system guidelines
4. Test image upload and processing flows
5. Ensure responsive design works on mobile

## License

This project is part of the Meesho Seller Support ecosystem.