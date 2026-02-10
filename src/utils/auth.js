// Authentication utilities
export const authService = {
  // Get all users from localStorage
  getUsers: () => {
    const users = localStorage.getItem('star_step_users');
    return users ? JSON.parse(users) : [];
  },

  // Save users to localStorage
  saveUsers: (users) => {
    localStorage.setItem('star_step_users', JSON.stringify(users));
  },

  // Register new user
  register: (email, password, name) => {
    const users = authService.getUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return { success: false, message: 'Este email já está registrado!' };
    }

    // Add new user
    const newUser = {
      id: Date.now(),
      email,
      password, // In production, this should be hashed!
      name,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    authService.saveUsers(users);
    
    return { success: true, message: 'Conta criada com sucesso!' };
  },

  // Login user
  login: (email, password) => {
    const users = authService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Save current user
      localStorage.setItem('star_step_current_user', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name
      }));
      return { success: true, user };
    }

    return { success: false, message: 'Email ou senha incorretos!' };
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('star_step_current_user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('star_step_current_user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return authService.getCurrentUser() !== null;
  }
};

// Activity management
export const activityService = {
  getActivities: () => {
    const activities = localStorage.getItem('star_step_activities');
    return activities ? JSON.parse(activities) : [];
  },

  saveActivity: (activity) => {
    const activities = activityService.getActivities();
    activities.push({ ...activity, id: Date.now() });
    localStorage.setItem('star_step_activities', JSON.stringify(activities));
  },

  deleteActivity: (id) => {
    const activities = activityService.getActivities();
    const filtered = activities.filter(a => a.id !== id);
    localStorage.setItem('star_step_activities', JSON.stringify(filtered));
  },

  clearActivities: () => {
    localStorage.setItem('star_step_activities', JSON.stringify([]));
  }
};
