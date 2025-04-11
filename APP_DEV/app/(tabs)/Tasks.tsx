import { View, Text, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, ArrowRight, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react-native';

const mockTasks = [
  {
    id: 1,
    image: 'https://images.squarespace-cdn.com/content/v1/573365789f726693272dc91a/1704992146415-CI272VYXPALWT52IGLUB/AdobeStock_201419293.jpeg?format=1500w',
    type: 'Pothole',
    severity: 'High',
    status: 'Pending',
    location: '123 Main St, City',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    date: '2024-02-20',
    description: 'Large pothole causing traffic disruption. Immediate attention required.',
  },
  {
    id: 2,
    image: 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
    type: 'Road Crack',
    severity: 'Medium',
    status: 'In Progress',
    location: '456 Oak Ave, City',
    coordinates: { lat: 40.7142, lng: -74.0064 },
    date: '2024-02-19',
    description: 'Longitudinal crack extending across lane. Requires sealing.',
  },
  {
    id: 3,
    image: 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
    type: 'Surface Damage',
    severity: 'Low',
    status: 'Pending',
    location: '789 Pine Rd, City',
    coordinates: { lat: 40.7135, lng: -74.0057 },
    date: '2024-02-18',
    description: 'Surface wear showing signs of deterioration. Schedule maintenance.',
  },
];

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

const openMapsWithDirections = (coordinates: { lat: number; lng: number }) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
  Linking.openURL(url);
};

export default function Tasks() {
  const router = useRouter();

  const TaskCard = ({ task }: { task: typeof mockTasks[0] }) => (
    <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
      <View className="flex-row">
        <Image source={{ uri: task.image }} className="w-32 h-full" />
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-lg font-bold text-gray-900">{task.type}</Text>
              <Text className="text-sm text-gray-500">{task.location}</Text>
            </View>
            <View className={`px-2 py-1 rounded-full ${getSeverityColor(task.severity)}`}>
              <Text className="text-xs text-white font-semibold">{task.severity}</Text>
            </View>
          </View>
          
          {/* <Text numberOfLines={2} className="text-sm text-gray-600 mb-3">
            {task.description}
          </Text> */}

          <View className="flex-row justify-between items-center">
            <View className={`px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
              <Text className="text-xs text-white font-semibold">{task.status}</Text>
            </View>
            <Text className="text-xs text-gray-400">{task.date}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row border-t border-gray-100 divide-x divide-gray-100">
        <TouchableOpacity 
          className="flex-1 flex-row items-center justify-center py-3 bg-gray-50"
          
        >
          <ArrowRight size={16} color="#3b82f6" />
          <Text className="text-sm text-blue-500 ml-2">Details</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-1 flex-row items-center justify-center py-3 bg-gray-50"
          onPress={() => openMapsWithDirections(task.coordinates)}
        >
          <MapPin size={16} color="#3b82f6" />
          <Text className="text-sm text-blue-500 ml-2">Navigate</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-1 flex-row items-center justify-center py-3 bg-gray-50"
          onPress={() => {/* Handle mark as resolved */}}
        >
          <CheckCircle2 size={16} color="#3b82f6" />
          <Text className="text-sm text-blue-500 ml-2">Resolve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4">
        <Text className="text-2xl font-bold text-gray-900">Tasks</Text>
        <View className="flex-row items-center mt-2">
          <AlertCircle size={16} color="#6b7280" />
          <Text className="text-gray-500 ml-2">{mockTasks.length} tasks assigned</Text>
        </View>
      </View>

      {/* Task List */}
      <ScrollView className="flex-1 px-5 pt-4">
        {mockTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ScrollView>
    </View>
  );
}