import React, { useState } from 'react';

interface BookingRequest {
  id: string;
  customerName: string;
  service: string;
  time: string;
  price: number;
  countdown: number;
}

interface ScheduleItem {
  id: string;
  customerName?: string;
  service?: string;
  time: string;
  status: 'Completed' | 'In Progress' | 'PENDING';
}

const SalonOwnerHomePage: React.FC = () => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([
    {
      id: '1',
      customerName: 'Ankit',
      service: 'Haircut',
      time: '5:00 PM',
      price: 299,
      countdown: 135, // 02:15
    }
  ]);

  const schedule: ScheduleItem[] = [
    { id: '1', customerName: 'Rahul', service: 'Haircut', time: '4:00 PM', status: 'Completed' },
    { id: '2', customerName: 'Aman', service: 'Facial', time: '4:30 PM', status: 'In Progress' },
    { id: '3', time: '5:00 PM', status: 'PENDING' },
  ];

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto font-sans pb-10">
      {/* Top Branding Section */}
     

      {/* Quick Stats Grid */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm text-center border border-gray-100">
          <p className="text-gray-500 text-[11px] mb-1">Bookings Today</p>
          <p className="text-2xl font-bold text-gray-800">18</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center border border-gray-100">
          <p className="text-gray-500 text-[11px] mb-1">Revenue Today</p>
          <p className="text-2xl font-bold text-gray-800">₹12,400</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center border border-gray-100">
          <p className="text-gray-500 text-[11px] mb-1">Cancellations</p>
          <p className="text-2xl font-bold text-red-500">2</p>
        </div>
      </div>

      {/* Booking Requests */}
      <div className="px-4 mb-6">
        <h2 className="text-gray-800 font-bold mb-3">Booking Requests</h2>
        {bookingRequests.map((req) => (
          <div key={req.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src="/dummy_logo.png" alt="user" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{req.customerName}</h3>
                  <p className="text-sm text-gray-500">{req.service}  •  {req.time}  •  <span className="font-semibold text-gray-800">₹{req.price}</span></p>
                </div>
              </div>
              <button className="text-gray-400">•••</button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center py-2 text-sm text-gray-600 font-medium">
                Expires in <span className="text-gray-900">{formatCountdown(req.countdown)}</span>
              </div>
              <button className="flex-1 bg-[#4CAF50] text-white py-2 rounded-md font-medium text-sm">Accept</button>
              <button className="flex-1 bg-[#E57373] text-white py-2 rounded-md font-medium text-sm">Reject</button>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="px-4">
        <h2 className="text-gray-800 font-bold mb-3">Today's Schedule</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {schedule.map((item, idx) => (
            <div 
              key={item.id} 
              className={`flex items-center justify-between p-4 ${idx !== schedule.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="text-sm text-gray-700 font-medium">
                {item.time} {item.customerName && `• ${item.customerName}`} {item.service && `• ${item.service}`}
              </div>
              
              <div className={`px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wide
                ${item.status === 'Completed' ? 'text-green-600' : ''}
                ${item.status === 'In Progress' ? 'bg-orange-50 text-orange-400' : ''}
                ${item.status === 'PENDING' ? 'bg-orange-100 text-orange-500' : ''}
              `}>
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalonOwnerHomePage;