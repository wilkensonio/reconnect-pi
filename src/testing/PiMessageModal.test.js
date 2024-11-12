import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PiMessageModal from '../components/PiMessageModal';
import { apiService } from '../services/api';

jest.mock('../services/api');
jest.mock('../styles/PiMessageModal.css', () => ({}));


describe('PiMessageModal Integration Test', () => {
    const mockMessages = [
        {
            user_id: '1',
            first_name: 'John',
            last_name: 'Doe',
            message: 'Message 1',
            duration: 1,
            duration_unit: 'seconds',
        },
        {
            user_id: '2',
            first_name: 'Jane',
            last_name: 'Smith',
            message: 'Message 2',
            duration: 1,
            duration_unit: 'seconds',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays and navigates through messages', async () => {
        const onClose = jest.fn();
        
        render(<PiMessageModal messages={mockMessages} onClose={onClose} />);
        
        await waitFor(() => screen.getByText('Important Messages'));
        
        expect(screen.getByText('Message 1')).toBeInTheDocument();
        
        fireEvent.click(screen.getByText('Next'));

        expect(screen.getByText('Message 2')).toBeInTheDocument();
        
        fireEvent.click(screen.getByText('Previous'));

        expect(screen.getByText('Message 1')).toBeInTheDocument();
    });

    test('closes the modal when all messages expire', async () => {
        const onClose = jest.fn();
        
        const expiredMessages = [
            {
                user_id: '1',
                first_name: 'John',
                last_name: 'Doe',
                message: 'Message 1',
                duration: 1,
                duration_unit: 'seconds',
            },
            {
                user_id: '2',
                first_name: 'Jane',
                last_name: 'Smith',
                message: 'Message 2',
                duration: 1,
                duration_unit: 'seconds',
            },
        ];

        apiService.deletePiMessage.mockResolvedValueOnce(true);
        
        render(<PiMessageModal messages={expiredMessages} onClose={onClose} />);
        
        await waitFor(() => screen.getByText('Important Messages'));

        await waitFor(() => expect(apiService.deletePiMessage).toHaveBeenCalledTimes(2));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('does not display any messages when the messages array is empty', () => {
        const onClose = jest.fn();
        
        render(<PiMessageModal messages={[]} onClose={onClose} />);
        
        expect(screen.queryByText('Important Messages')).not.toBeInTheDocument();
    });
});
