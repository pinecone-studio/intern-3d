import type { DashboardIconName } from './dashboard-ui';

export type DashboardSectionId =
  | 'home'
  | 'tasks'
  | 'groups'
  | 'events'
  | 'knowledge'
  | 'exams'
  | 'polls';

export type DashboardSectionItem = {
  id: DashboardSectionId;
  label: string;
  icon: DashboardIconName;
};

export type DashboardSectionMeta = {
  eyebrow: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  actionLabel: string;
  quickNotes: string[];
  statusValue: string;
  statusText: string;
  statusChange: string;
};

export const dashboardSections: DashboardSectionItem[] = [
  { id: 'home', label: 'Хяналтын самбар', icon: 'home' },
  { id: 'tasks', label: 'Ажил даалгавар', icon: 'checklist' },
  { id: 'groups', label: 'Бүлэг', icon: 'users' },
  { id: 'events', label: 'Эвент', icon: 'calendar' },
  { id: 'knowledge', label: 'Мэдээллийн сан', icon: 'book' },
  { id: 'exams', label: 'Шалгалт', icon: 'graduation' },
  { id: 'polls', label: 'Санал асуулга', icon: 'poll' },
];

export const dashboardSectionMeta: Record<
  DashboardSectionId,
  DashboardSectionMeta
> = {
  home: {
    eyebrow: 'Smart Workplace System',
    title: 'Өдрийн төвлөрөлтэй хяналтын самбар',
    description: '',
    searchPlaceholder: 'Knowledge base эсвэл ажилтан хайх...',
    actionLabel: 'Өдрийн фокус',
    quickNotes: [],
    statusValue: '4 карт',
    statusText: 'өнөөдрийн фокусыг төвөггүй харуулах home view',
    statusChange: 'Цэгцтэй',
  },
  tasks: {
    eyebrow: 'Ажил даалгаврын удирдлага',
    title: 'Ажил даалгаврын удирдлага',
    description:
      'Даалгавар үүсгэх, эзэн оноох, deadline болон явцыг бодит зураглалтай харах хэсэг.',
    searchPlaceholder: 'Даалгавар, эзэн, хугацаа хайх...',
    actionLabel: 'Ажил үүсгэх',
    quickNotes: ['Deadline хяналттай', 'Багийн ачаалал шууд харагдана'],
    statusValue: '48 ажил',
    statusText: 'энэ 7 хоногийн идэвхтэй ажлууд хянагдаж байна',
    statusChange: '+6 шинэ',
  },
  groups: {
    eyebrow: 'Бүлгийн систем',
    title: 'Баг ба төслийн бүлгүүд',
    description:
      'Бүлэг бүр дээр танилцуулга, task, календарь, оролцогчдын мэдээллийг нэг дороос үзнэ.',
    searchPlaceholder: 'Бүлэг, төсөл, гишүүн хайх...',
    actionLabel: 'Бүлэг үүсгэх',
    quickNotes: ['Төсөл тус бүрт тусдаа орон зай', 'Календарьтай уялдсан'],
    statusValue: '9 бүлэг',
    statusText: 'идэвхтэй баг, төслүүд дотоод мэдээллээ шинэчилж байна',
    statusChange: '+2 шинэ',
  },
  events: {
    eyebrow: 'Эвентийн орон зай',
    title: 'Нэг удаагийн эвентүүд',
    description:
      'Зугаалга, арга хэмжээ, уулзалтын түр бүлгүүдийг файлууд, оролцогчид, цагийн хамт удирдах хэсэг.',
    searchPlaceholder: 'Эвент, байршил, огноо хайх...',
    actionLabel: 'Эвент үүсгэх',
    quickNotes: ['Оролцогчид нэг дор', 'Файл, цаг, байршил хамт хадгалагдана'],
    statusValue: '4 эвент',
    statusText: 'энэ сард түр бүлгээр нээгдсэн арга хэмжээнүүд',
    statusChange: '+1 шинэ',
  },
  knowledge: {
    eyebrow: 'Байгууллагын мэдээллийн сан',
    title: 'Байгууллагын мэдээллийн сан',
    description:
      'Дүрэм, журам, дотоод заавар, onboarding материалуудыг цэгцтэй сан болгож харуулна.',
    searchPlaceholder: 'Дүрэм, заавар, гарын авлага хайх...',
    actionLabel: 'Баримт нэмэх',
    quickNotes: ['Шинэ ажилтанд зориулсан маршруттай', 'Баримт ангиллаар хадгалагдана'],
    statusValue: '126 файл',
    statusText: 'гол баримтууд ангиллаар шинэчлэгдэн хадгалагдсан',
    statusChange: '+12 шинэ',
  },
  exams: {
    eyebrow: 'Шалгалтын систем',
    title: 'Сар бүрийн шалгалтууд',
    description:
      'Ажилчдын мэдлэгийг үнэлэх шалгалт, оролцоо, дүн, ахицын тайланг нэг дэлгэц дээр харуулна.',
    searchPlaceholder: 'Шалгалт, сэдэв, оролцогч хайх...',
    actionLabel: 'Шалгалт үүсгэх',
    quickNotes: ['Дүн хадгалагдана', 'Ахиц, оролцоо хэмжигдэнэ'],
    statusValue: '3 шалгалт',
    statusText: 'энэ сарын мэдлэг үнэлгээ хуваарьтай',
    statusChange: '92% оролцоо',
  },
  polls: {
    eyebrow: 'Шуурхай санал асуулга',
    title: 'Санал асуулгын төв',
    description:
      'Хурдан санал асуулга үүсгэж, хариуг бодит цагийн байдлаар харьцуулан харах хэсэг.',
    searchPlaceholder: 'Санал асуулга, сэдэв хайх...',
    actionLabel: 'Санал үүсгэх',
    quickNotes: ['Хариу шууд шинэчлэгдэнэ', 'Багийн шийдвэр хурдан гарна'],
    statusValue: '5 санал',
    statusText: 'идэвхтэй санал асуулгууд хариу цуглуулж байна',
    statusChange: '+87 хариу',
  },
};
