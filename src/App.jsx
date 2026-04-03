import React from 'react'
import { Route,Routes } from 'react-router-dom'
import Login from './Components/Login'
import Admin from './Components/Admin'
import EmployeeDashboard from './Components/EmployeeDashboard'
import Attendance from './Components/Attendance'
import LeaveRequest from './Components/LeaveRequest'
import User from './Components/User'
import Meeting from './Components/Meeting'
import UserMeetings from './Components/UserMeetings'
import Document from './Components/Document'
import Inventory from './Components/Inventory'
import UserInventoryRequest from './Components/UserInventoryRequest'
import InventoryRequestApproval from './Components/InventoryRequestApproval'
import PendingRequests from './Components/PendingRequests'
import UserRequests from './Components/UserRequests'
import Reports from './Components/Reports'
import Query from './Components/Query'
import LeaveApproval from './Components/LeaveApproval'
function App() {
  return (
    <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/admin' element={<Admin/>} />
        <Route path='/dashboard' element={<EmployeeDashboard/>} />
        <Route path='/attendance' element={<Attendance/>} />
        <Route path='/leave' element={<LeaveRequest/>} />
        <Route path="/user" element={<User/>} />
        <Route path="/meetings" element={<UserMeetings/>} />
        <Route path="/admin-meetings" element={<Meeting/>} />
        <Route path="/documents" element={<Document/>} />
        <Route path="/inventory" element={<Inventory/>} />
        <Route path="/user-inventory-request" element={<UserInventoryRequest/>} />
        <Route path="/inventory-approvals" element={<InventoryRequestApproval/>} />
        <Route path="/requests" element={<UserRequests/>} />
        <Route path="/pending-requests" element={<PendingRequests/>} />
        <Route path="/reports" element={<Reports/>} />
        <Route path="/query" element={<Query/>} />
        <Route path="/leave-approval" element={<LeaveApproval/>} />
    </Routes>

  )
}

export default App