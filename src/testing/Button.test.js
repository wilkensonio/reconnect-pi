import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/Button';
import '@testing-library/jest-dom';

describe('Button Component', () => {
  const mockOnClick = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with children content', () => {
    render(<Button>Click Me</Button>);

    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('handles the onClick event', () => {
    render(<Button onClick={mockOnClick}>Click Me</Button>);

    fireEvent.click(screen.getByText('Click Me'));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies the correct base and conditional styles', () => {
    render(
      <Button className="change-faculty-button full-width-button large-button cancel-button">
        Styled Button
      </Button>
    );

    const button = screen.getByText('Styled Button');

    expect(button).toHaveClass('button');
    expect(button).toHaveClass('button--faculty-change');
    expect(button).toHaveClass('button--full-width');
    expect(button).toHaveClass('button--large');
    expect(button).toHaveClass('button--danger');
  });

  it('defaults to button type if no type prop is provided', () => {
    render(<Button>Default Button</Button>);

    const button = screen.getByText('Default Button');

    expect(button).toHaveAttribute('type', 'button');
  });

  it('sets the button type when provided', () => {
    render(<Button type="submit">Submit Button</Button>);

    const button = screen.getByText('Submit Button');

    expect(button).toHaveAttribute('type', 'submit');
  });
});
