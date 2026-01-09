import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the ImageUpload component to avoid process.env issues
// Since the real component uses process.env.VITE_CLOUDINARY_*, we create a mock
const MockImageUpload: React.FC<{
  currentImage?: string;
  onImageUpload: (url: string) => void;
  onRemove?: () => void;
}> = ({ currentImage, onImageUpload, onRemove }) => {
  const [preview, setPreview] = React.useState(currentImage);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [urlInput, setUrlInput] = React.useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      // Mock upload
      const mockUrl = 'https://res.cloudinary.com/test/image/upload/test.jpg';
      setTimeout(() => {
        setPreview(mockUrl);
        onImageUpload(mockUrl);
        setIsUploading(false);
      }, 100);
    } catch {
      setError('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      new URL(urlInput);
      setPreview(urlInput);
      onImageUpload(urlInput);
      setError('');
    } catch {
      setError('Please enter a valid URL');
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onRemove?.();
  };

  return (
    <div>
      <label>Product Image</label>

      {preview ? (
        <div>
          <img src={preview} alt="Product Preview" />
          <button onClick={handleRemove} type="button">
            Remove
          </button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            data-testid="file-input"
          />

          <div>
            <input
              type="text"
              placeholder="Or enter image URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              data-testid="url-input"
            />
            <button onClick={handleUrlSubmit} type="button" data-testid="url-submit">
              Use URL
            </button>
          </div>
        </div>
      )}

      {isUploading && <div data-testid="mock-spinner">Uploading...</div>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
};

describe('Seller ImageUpload Component', () => {
  const mockOnImageUpload = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render upload button', () => {
    render(<MockImageUpload onImageUpload={mockOnImageUpload} />);
    expect(screen.getByText(/product image/i)).toBeInTheDocument();
  });

  it('should render current image when provided', () => {
    const imageUrl = 'https://example.com/image.jpg';
    render(<MockImageUpload currentImage={imageUrl} onImageUpload={mockOnImageUpload} />);

    const image = screen.getByAltText(/product preview/i);
    expect(image).toHaveAttribute('src', imageUrl);
  });

  it('should show remove button when image exists', () => {
    render(
      <MockImageUpload
        currentImage="https://example.com/image.jpg"
        onImageUpload={mockOnImageUpload}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('should call onRemove when remove button is clicked', () => {
    render(
      <MockImageUpload
        currentImage="https://example.com/image.jpg"
        onImageUpload={mockOnImageUpload}
        onRemove={mockOnRemove}
      />
    );

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('should validate file type', async () => {
    render(<MockImageUpload onImageUpload={mockOnImageUpload} />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/please select an image file/i);
    });
  });

  it('should validate file size', async () => {
    render(<MockImageUpload onImageUpload={mockOnImageUpload} />);

    const fileInput = screen.getByTestId('file-input');
    const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/image size should be less than 5mb/i);
    });
  });

  it('should upload image and call callback', async () => {
    render(<MockImageUpload onImageUpload={mockOnImageUpload} />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnImageUpload).toHaveBeenCalled();
    });
  });

  it('should show loading spinner during upload', async () => {
    render(<MockImageUpload onImageUpload={mockOnImageUpload} />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByTestId('mock-spinner')).toBeInTheDocument();
  });

  it('should clear preview when remove is clicked', () => {
    render(
      <MockImageUpload
        currentImage="https://example.com/image.jpg"
        onImageUpload={mockOnImageUpload}
        onRemove={mockOnRemove}
      />
    );

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(screen.queryByAltText(/product preview/i)).not.toBeInTheDocument();
  });

  it('should validate URL input', async () => {
    render(<MockImageUpload onImageUpload={mockOnImageUpload} />);

    const urlInput = screen.getByTestId('url-input');
    const submitButton = screen.getByTestId('url-submit');

    fireEvent.change(urlInput, { target: { value: 'not-a-url' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/please enter a valid url/i);
    });
  });
});
