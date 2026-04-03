# IT Management Information System (IT-MIS)

A comprehensive, professional IT management system built with React and Node.js for managing users, inventory, documents, and meetings.

## 🚀 Features

### 1. **User Management**
- Add, edit, and delete users
- Search and filter functionality
- Role-based access (Admin, User, Manager)
- Real-time user statistics
- Professional role badges

### 2. **Inventory Management**
- Track IT assets and equipment
- Add, edit, and delete inventory items
- Category-based organization
- Smart status indicators (In Stock, Low Stock, Out of Stock)
- Search functionality
- Real-time quantity tracking

### 3. **Document Management**
- Upload and manage documents
- Category-based organization (Policy, Report, Invoice, Meeting, Other)
- Download functionality
- Track upload date and uploader
- Delete documents

### 4. **Meeting Management**
- Schedule and manage meetings
- Track meeting details (title, description, date, time)
- View today's meetings
- Delete past meetings

### 5. **Admin Dashboard**
- Real-time statistics
- Quick action buttons
- Professional sidebar navigation
- Responsive design

## ✨ Professional Enhancements

### User Experience
- ✅ Loading states for all operations
- ✅ Toast notifications for success/error messages
- ✅ Confirmation dialogs before deletion
- ✅ Edit functionality for all modules
- ✅ Search and filter capabilities
- ✅ Smooth animations and transitions
- ✅ Professional icons throughout

### Design
- ✅ Modern gradient backgrounds
- ✅ Clean card-based layouts
- ✅ Consistent color scheme
- ✅ Professional typography
- ✅ Responsive design for mobile devices
- ✅ Hover effects and visual feedback
- ✅ Status badges and indicators

### Code Quality
- ✅ Error handling for all API calls
- ✅ Input validation
- ✅ Disabled states during loading
- ✅ Clean component structure
- ✅ Reusable notification system
- ✅ Proper state management

## 🛠️ Technology Stack

### Frontend
- React 19.2.0
- React Router DOM 7.13.0
- Axios 1.13.5
- Vite 7.2.4

### Styling
- Custom CSS with modern design patterns
- Flexbox and Grid layouts
- CSS animations and transitions
- Responsive design

## 📦 Installation

1. Clone the repository
```bash
git clone <repository-url>
cd IT_Information_System.project/IT_Project
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## 🔧 Configuration

Make sure your backend API is running on `http://localhost:5000` with the following endpoints:

### User Endpoints
- GET `/api/users` - Get all users
- POST `/api/add-user` - Add new user
- PUT `/api/update-user/:id` - Update user
- DELETE `/api/delete-user/:id` - Delete user

### Inventory Endpoints
- GET `/api/get-inventory` - Get all inventory items
- POST `/api/add-inventory` - Add new item
- PUT `/api/update-inventory/:id` - Update item
- DELETE `/api/delete-inventory/:id` - Delete item

### Document Endpoints
- GET `/api/documents` - Get all documents
- POST `/api/add-document` - Upload document
- DELETE `/api/delete-document/:id` - Delete document

### Meeting Endpoints
- GET `/api/meetings` - Get all meetings
- POST `/api/add-meeting` - Add new meeting
- DELETE `/api/delete-meeting/:id` - Delete meeting

### Auth Endpoints
- POST `/api/login` - User login

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1920px and above)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (below 768px)

## 🎨 Color Scheme

- Primary: #3498db (Blue)
- Success: #27ae60 (Green)
- Danger: #e74c3c (Red)
- Warning: #e67e22 (Orange)
- Info: #9b59b6 (Purple)
- Dark: #2c3e50
- Light: #f5f5f5

## 🔐 Security Features

- Password-protected login
- Role-based access control
- Confirmation dialogs for destructive actions
- Input validation
- Error handling

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributors

- Your Team Name

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Made with ❤️ by Your Team**
# frontend_IT
# frontend_IT
