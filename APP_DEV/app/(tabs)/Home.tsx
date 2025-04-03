import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, ClipboardList, CircleUser as UserCircle, MapPin, Calendar } from 'lucide-react-native';

const mockUser = {
  name: 'John Doe',
  stats: {
    totalReports: 24,
    pendingTasks: 5,
    resolvedCases: 19,
  },
  recentReports: [
    {
      id: 1,
      image: 'https://images.squarespace-cdn.com/content/v1/573365789f726693272dc91a/1704992146415-CI272VYXPALWT52IGLUB/AdobeStock_201419293.jpeg?format=1500w',
      type: 'Pothole',
      severity: 'High',
      status: 'Pending',
      location: 'Miyapur, Hyderabad',
      date: '2024-02-20',
    },
    {
      id: 2,
      image: 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
      type: 'Crack',
      severity: 'Medium',
      status: 'In Progress',
      location: 'Narayanaguda',
      date: '2024-02-19',
    },
    {
      id: 3,
      image: 'https://media.istockphoto.com/id/183851840/photo/bad-repair-pothole-in-road-t-junction-suffers-frost-damage.jpg?s=612x612&w=0&k=20&c=C6x40SIitvOnljrXy-1AZcZ16k3rhmkqnXEDVz-ifZ0=',
      type: 'Surface Damage',
      severity: 'Low',
      status: 'Completed',
      location: 'Gachibowli',
      date: '2024-02-18',
    },
  ],
};

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-red-500';
    case 'in progress':
      return 'bg-amber-500';
    case 'completed':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export default function Home() {
  const router = useRouter();

  const QuickActionButton = ({ icon, label, onPress }: any) => (
    <TouchableOpacity
      className="flex-1 items-center bg-blue-50 p-4 rounded-xl mx-1 shadow-sm"
      onPress={onPress}
    >
      {icon}
      <Text className="text-xs text-blue-500 mt-2 text-center">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="flex-row justify-between items-center p-5 pt-14 bg-white">
        <View>
          <Text className="text-base text-gray-500">Welcome back,</Text>
          <Text className="text-2xl font-bold text-gray-900">{mockUser.name}</Text>
        </View>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60' }}
          className="w-12 h-12 rounded-full"
        />
      </View>

      {/* Stats Section */}
      <View className="px-5 py-6 bg-white mt-[1px]">
        <View className="flex-row justify-between">
          <View className="flex-1 items-center bg-blue-50 p-4 rounded-2xl mr-2">
            <Text className="text-2xl font-bold ">{mockUser.stats.totalReports}</Text>
            <Text className="text-sm text-blue-500 text-center mt-1">Total Reports</Text>
          </View>
          <View className="flex-1 items-center bg-blue-50 p-4 rounded-2xl mx-2">
            <Text className="text-2xl font-bold ">{mockUser.stats.pendingTasks}</Text>
            <Text className="text-sm text-amber-700 text-center mt-1">Pending Tasks</Text>
          </View>
          <View className="flex-1 items-center bg-blue-50 p-4 rounded-2xl ml-2">
            <Text className="text-2xl font-bold ">{mockUser.stats.resolvedCases}</Text>
            <Text className="text-sm text-green-700 mt-1">Resolved</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="p-5 bg-white mt-3">
        <Text className="text-lg font-bold text-gray-900 mb-4">Quick Actions</Text>
        <View className="flex-row justify-between">
          <QuickActionButton
            icon={<Camera size={24} color="#3b82f6" />}
            label="Upload Image"
            onPress={() => router.push('/Upload')}
          />
          <QuickActionButton
            icon={<ClipboardList size={24} color="#3b82f6" />}
            label="View Tasks"
            onPress={() => router.push('/Tasks')}
          />
          <QuickActionButton
            icon={<UserCircle size={24} color="#3b82f6" />}
            label="Profile"
            onPress={() => router.push('/Profile')}
          />
        </View>
      </View>

      {/* Recent Reports */}
      <View className="p-5 bg-white mt-3 mb-5">
        <Text className="text-lg font-bold text-gray-900 mb-4">Recent Reports</Text>
        {mockUser.recentReports.map((report) => (
          <View key={report.id} className="flex-row bg-white rounded-xl mb-4 border border-gray-100 overflow-hidden">
            <Image source={{ uri: report.image }} className="w-24 h-24" />
            <View className="flex-1 p-3">
              <View className="flex-row justify-between items-center ">
                <Text className="text-base font-bold text-gray-900">{report.type}</Text>
                <View className={`px-2 py-1 rounded-full ${getSeverityColor(report.severity)}`}>
                  <Text className="text-xs text-white font-bold">{report.severity}</Text>
                </View>
              </View>
              <View className='flex-row  items-center'>
                <View className='flex-row justify-center items-center gap-1'>
                  <MapPin size={14} color="#6b7280" />
                  <Text className="text-sm text-gray-500 mb-2 mt-1">{report.location}</Text>
                </View>
              </View>
              <View className="flex-row justify-between items-center">

                <View className='flex-row justify-center items-center gap-1'>
                  <Calendar size={12} color="#9ca3af" />
                  <Text className="text-xs text-gray-400">{report.date}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                  <Text className="text-xs text-white font-bold">{report.status}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}