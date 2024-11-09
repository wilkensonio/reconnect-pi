import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/Button';
import '@testing-library/jest-dom'; // Correct import for jest-dom

// Mocking the CSS import
jest.mock('../styles/Button.css', () => ({}));

describe('Button Component', () => {
  const handleClick = jest.fn();

  // Clear mock function after each test
  afterEach(() => {
    handleClick.mockClear(); 
  });

  it('renders the button with children content', () => {
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    // Assert that button text is rendered
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls the onClick handler when clicked', () => {
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    // Simulate a click event
    fireEvent.click(screen.getByText('Click Me'));
    
    // Assert that the click handler was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the default type of "button" if no type is provided', () => {
    render(<Button onClick={handleClick}>Default Button</Button>);
    
    // Assert that the button has the default type 'button'
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('sets the button type attribute based on the type prop', () => {
    render(<Button onClick={handleClick} type="submit">Submit</Button>);
    
    // Assert that the button has the correct type 'submit'
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('adds "button--faculty-change" class when className includes "change-faculty-button" or "back-button"', () => {
    const { rerender } = render(<Button className="change-faculty-button">Change Faculty</Button>);
    
    // Assert the button has the correct class
    expect(screen.getByRole('button')).toHaveClass('button--faculty-change');

    rerender(<Button className="back-button">Back</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--faculty-change');
  });

  it('adds "button--full-width" class when className includes "full-width-button"', () => {
    render(<Button className="full-width-button">Full Width</Button>);
    
    // Assert the button has the correct class
    expect(screen.getByRole('button')).toHaveClass('button--full-width');
  });

  it('adds "button--large" class when className includes "large-button"', () => {
    render(<Button className="large-button">Large Button</Button>);
    
    // Assert the button has the correct class
    expect(screen.getByRole('button')).toHaveClass('button--large');
  });

  it('adds "button--danger" class when className includes "cancel-button"', () => {
    render(<Button className="cancel-button">Cancel</Button>);
    
    // Assert the button has the correct class
    expect(screen.getByRole('button')).toHaveClass('button--danger');
  });

  it('includes any additional class names provided in the className prop', () => {
    render(<Button className="extra-class">Extra Class</Button>);
    
    // Assert the button has the additional class
    expect(screen.getByRole('button')).toHaveClass('extra-class');
  });
});
