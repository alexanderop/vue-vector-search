# Semantic Search Vue Application

A Vue.js application that demonstrates how to implement semantic search using transformer-based embeddings directly in the browser.

## Overview

This application showcases the power of semantic search by using modern language models to understand the meaning behind text queries rather than just matching keywords. It uses the Transformers.js library to generate vector embeddings for text and performs similarity search using cosine similarity.

## Features

- **In-browser Semantic Search**: Performs semantic search without server requests using Hugging Face Transformers.js
- **Vector Embeddings**: Generates and compares vector embeddings for text
- **Real-time Results**: Shows top search results with similarity percentages
- **Progressive Loading**: Displays progress while downloading the model
- **Responsive Design**: Works on mobile and desktop devices
- **Dark Mode Support**: Adapts to user preference

## How It Works

1. **Language Model**: Uses the `Supabase/gte-small` model (with fallback to `Xenova/all-MiniLM-L6-v2`)
2. **Vector Embeddings**: Converts text into high-dimensional vector representations
3. **Cosine Similarity**: Measures the similarity between query and database items
4. **Web Workers**: Performs calculations in a background thread for better performance

## Technical Implementation

### Components

- **SemanticSearch.vue**: Main component that handles the UI and search functionality
- **embeddingWorker.js**: Web Worker for background processing of embeddings
- **vectorUtils.ts**: Utility functions for vector operations

### Technologies Used

- **Vue.js 3**: Frontend framework with Composition API
- **Transformers.js**: Browser-based machine learning library
- **Web Workers API**: For non-blocking background processing
- **TailwindCSS**: For styling
- **TypeScript**: For type safety

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/semantic-search-vue.git
cd semantic-search-vue

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
```

### Building for Production

```bash
# Build for production
npm run build
# or
yarn build
```

## Usage

1. Open the application in your browser
2. Wait for the model to download (first time only)
3. Enter a search query in the search box
4. Click "Search" or press Enter
5. View the top 3 semantically similar items

## Performance Considerations

- The model is approximately 40MB and is downloaded on first use
- Processing speed depends on your device's capabilities
- WebGPU is used when available, with fallback to WebAssembly

## Customization

### Adding More Items

To add more items to the database, modify the `useSemanticSearch` initialization in `SemanticSearch.vue`:

```js
const { ... } = useSemanticSearch([
  "Bed", "Car", "Train", "Cat", "Dog", "Apple", 
  "Boat", "Mouse", "Chair", "Table", "Laptop", "Bird",
  // Add your items here
]);
```

### Changing the Model

To use a different embedding model, modify the `PipelineSingleton` class in `embeddingWorker.js`:

```js
class PipelineSingleton {
  static task = "feature-extraction";
  static model = "your-preferred-model";
  static fallbackModel = "your-fallback-model";
  // ...
}
```

## Browser Compatibility

- Works in modern browsers (Chrome, Firefox, Edge, Safari)
- WebGPU support provides better performance in compatible browsers

## License

[MIT License](LICENSE)

## Acknowledgements

- [Hugging Face](https://huggingface.co/) for the Transformers.js library
- [Vue.js](https://vuejs.org/) for the reactive framework
- [Supabase](https://supabase.io/) for the GTE-small embedding model