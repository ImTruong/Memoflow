import { colors } from '../theme/colors';

export type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  iconType: 'material' | 'fontAwesome';
  bgColor: string;
  iconColor: string;
  hasAction?: boolean;
  actionText?: string;
  isRead?: boolean;
};

export const notificationsData: Notification[] = [
  {
    id: '1',
    title: 'Đã đến giờ học rồi!',
    description: 'Cùng ôn tập từ "Priority" để ghi nhớ lâu hơn nhé.',
    time: '2p trước',
    icon: 'clock-outline',
    iconType: 'material',
    bgColor: '#E6EFFF',
    iconColor: '#3B82F6',
    isRead: false,
  },
  {
    id: '2',
    title: 'Nhắc nhở học tập',
    description: 'Đừng quên ôn lại từ "Destination" hôm nay nhé.',
    time: '1h trước',
    icon: 'book-open',
    iconType: 'fontAwesome',
    bgColor: '#E8FDF5',
    iconColor: '#10B981',
    isRead: false,
  },
  {
    id: '3',
    title: 'Duy trì chuỗi học tập!',
    description: 'Chỉ còn vài giờ nữa để giữ vững chuỗi 12 ngày học của bạn. Học ngay nào!',
    time: '3h trước',
    icon: 'fire',
    iconType: 'fontAwesome',
    bgColor: '#FFF7ED',
    iconColor: '#F97316',
    hasAction: true,
    actionText: 'Học ngay',
    isRead: false,
  },
  {
    id: '4',
    title: 'Bộ từ vựng mới!',
    description: 'Bộ từ vựng "Giao tiếp công sở" vừa được cập nhật. Khám phá ngay!',
    time: 'Hôm qua',
    icon: 'sparkles',
    iconType: 'material',
    bgColor: '#F5F3FF',
    iconColor: '#8B5CF6',
    isRead: false,
  },
];

export const readNotificationsData: Notification[] = [
  {
    id: '5',
    title: 'Hoàn thành mục tiêu',
    description: 'Chúc mừng bạn đã hoàn thành mục tiêu 50 từ vựng tuần này.',
    time: '2 ngày',
    icon: 'check-circle',
    iconType: 'material',
    bgColor: '#F3F4F6',
    iconColor: '#9CA3AF',
    isRead: true,
  },
  {
    id: '6',
    title: 'Hoàn thành mục tiêu',
    description: 'Chúc mừng bạn đã hoàn thành mục tiêu 50 từ vựng tuần này.',
    time: '2 ngày',
    icon: 'check-circle',
    iconType: 'material',
    bgColor: '#F3F4F6',
    iconColor: '#9CA3AF',
    isRead: true,
  },
];
