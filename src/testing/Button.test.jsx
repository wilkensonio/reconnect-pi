import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/Button';

jest.mock('../styles/Button.css', () => ({}));

describe('Button Component', () => {
  const handleClick = jest.fn();

  afterEach(() => {
    handleClick.mockClear(); 
  });

  it('renders the button with children content', () => {
    render(<Button onClick={handleClick}>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls the onClick handler when clicked', () => {
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the default type of "button" if no type is provided', () => {
    render(<Button onClick={handleClick}>Default Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('sets the button type attribute based on the type prop', () => {
    render(<Button onClick={handleClick} type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('adds "button--faculty-change" class when className includes "change-faculty-button" or "back-button"', () => {
    const { rerender } = render(<Button className="change-faculty-button">Change Faculty</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--faculty-change');

    rerender(<Button className="back-button">Back</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--faculty-change');
  });

  it('adds "button--full-width" class when className includes "full-width-button"', () => {
    render(<Button className="full-width-button">Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--full-width');
  });

  it('adds "button--large" class when className includes "large-button"', () => {
    render(<Button className="large-button">Large Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--large');
  });

  it('adds "button--danger" class when className includes "cancel-button"', () => {
    render(<Button className="cancel-button">Cancel</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--danger');
  });

  it('includes any additional class names provided in the className prop', () => {
    render(<Button className="extra-class">Extra Class</Button>);
    expect(screen.getByRole('button')).toHaveClass('extra-class');
  });
});
