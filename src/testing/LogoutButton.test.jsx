import { render, fireEvent } from '@testing-library/react';
import LogoutButton from './LogoutButton'; // Adjust the import based on your file structure

test('handles logout error gracefully', async () => {
  const mockNavigate = jest.fn();
  const mockLogout = jest.fn().mockRejectedValue(new Error('Logout failed'));

  // Render the component with necessary props
  render(<LogoutButton logout={mockLogout} navigate={mockNavigate} />);

  // Simulate button click
  fireEvent.click(screen.getByText('Logout'));

  // Assert expectations
  expect(mockLogout).toHaveBeenCalledTimes(1);
  expect(mockNavigate).not.toHaveBeenCalled();
});