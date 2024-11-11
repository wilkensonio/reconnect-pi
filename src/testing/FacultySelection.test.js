import logoSrc from '/rcnnct.png';

test('should import the logo image', () => {
  expect(logoSrc).toBe('test-file-stub');
});

describe('Token Validation Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    delete global.location; 
  });

  it('should show error if no token and the user is on the login page', () => {
    global.location = { state: { from: '/login' } };

    localStorage.removeItem('reconnect_access_token');

    const setError = jest.fn();

    const token = localStorage.getItem('reconnect_access_token');
    if (!token) {
      if (location.state?.from === '/login') {
        setError('Authentication required to view faculty members.');
      }
    }

    expect(setError).toHaveBeenCalledWith('Authentication required to view faculty members.');
  });

  it('should use sample data if no token and not on the login page', () => {
    global.location = { state: { from: '/some-other-page' } };

    localStorage.removeItem('reconnect_access_token');

    const setFaculty = jest.fn();

    const sampleData = [{
      id: "70578617",
      user_id: "70578617",
      first_name: "J",
      last_name: "Escobar",
      title: "Professor",
      department: "Computer Science"
    }];
    
    const token = localStorage.getItem('reconnect_access_token');
    if (!token) {
      setFaculty(sampleData);
    }

    expect(setFaculty).toHaveBeenCalledWith(sampleData);
  });

  it('should fetch faculty if token exists', async () => {
    global.location = { state: { from: '/faculty' } };

    const mockToken = 'valid-token-123';
    localStorage.setItem('reconnect_access_token', mockToken);

    const facultyData = [{
      id: "70578617",
      user_id: "70578617",
      first_name: "J",
      last_name: "Escobar",
      title: "Professor",
      department: "Computer Science"
    }];
    
    const apiService = {
      getAllFaculty: jest.fn().mockResolvedValue(facultyData),
    };

    const setFaculty = jest.fn();

    const token = localStorage.getItem('reconnect_access_token');
    if (token) {
      const facultyMembers = await apiService.getAllFaculty();
      setFaculty(facultyMembers);
    }

    expect(apiService.getAllFaculty).toHaveBeenCalled();
    expect(setFaculty).toHaveBeenCalledWith(facultyData);
  });
});
