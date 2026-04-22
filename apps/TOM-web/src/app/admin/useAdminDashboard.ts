'use client';

import { useState } from 'react';

import {
  createManagedUser,
  createPendingRequest,
  formatThresholdLabel,
  initialActiveClubs,
  initialForm,
  initialManagedUsers,
  initialRequests,
  initialSpamQueue,
  initialUserForm,
  requestToActiveClub,
  type ClubForm,
  type ClubRequest,
  type ManagedUser,
  type UserForm,
  thresholdGoal,
} from './admin-data';

export function useAdminDashboard() {
  const [form, setForm] = useState(initialForm);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [requests, setRequests] = useState(initialRequests);
  const [activeClubs, setActiveClubs] = useState(initialActiveClubs);
  const [spamQueue, setSpamQueue] = useState(initialSpamQueue);
  const [users, setUsers] = useState(initialManagedUsers);
  const [banner, setBanner] = useState(
    'Шинэ клубийн хүсэлтүүдийг шалгаж, боломжтойг нь идэвхжүүлж, spam-ийг хурдан цэвэрлэ.'
  );

  const updateField = (field: keyof ClubForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  const updateUserField = (field: keyof UserForm, value: string) => {
    setUserForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetUserForm = () => {
    setUserForm(initialUserForm);
  };

  const handleCreate = () => {
    const newRequest: ClubRequest = createPendingRequest(form);

    setRequests((current) => [newRequest, ...current]);
    setBanner(`${newRequest.clubName} шалгах дараалалд нэмэгдлээ.`);
    setForm(initialForm);
  };

  const handleCreateUser = () => {
    const newUser: ManagedUser = createManagedUser(userForm);

    setUsers((current) => [newUser, ...current]);
    setBanner(`${newUser.name} хэрэглэгчийн бүртгэл нэмэгдлээ.`);
    setUserForm(initialUserForm);
  };

  const approveRequest = (requestId: string) => {
    const request = requests.find((item) => item.id === requestId);

    if (!request) return;

    setRequests((current) =>
      current.map((item) =>
        item.id === requestId
          ? { ...item, requestStatus: 'approved', clubStatus: 'active' }
          : item
      )
    );

    setActiveClubs((current) => {
      const nextClub = requestToActiveClub(request);
      return [nextClub, ...current.filter((item) => item.id !== requestId)];
    });
    setBanner(`${request.clubName} батлагдаж active төлөвт шилжлээ.`);
  };

  const rejectRequest = (requestId: string) => {
    const request = requests.find((item) => item.id === requestId);

    if (!request) return;

    setRequests((current) =>
      current.map((item) =>
        item.id === requestId
          ? { ...item, requestStatus: 'rejected', clubStatus: 'paused' }
          : item
      )
    );
    setActiveClubs((current) =>
      current.filter((item) => item.id !== requestId)
    );
    setBanner(`${request.clubName} татгалзагдлаа.`);
  };

  const toggleClubStatus = (clubId: string) => {
    setActiveClubs((current) =>
      current.map((club) => {
        if (club.id !== clubId) {
          return club;
        }

        const nextStatus = club.clubStatus === 'active' ? 'paused' : 'active';
        return {
          ...club,
          clubStatus: nextStatus,
          requestStatus: nextStatus === 'active' ? 'approved' : club.requestStatus,
        };
      })
    );
    setBanner('Клубийн төлөв шинэчлэгдлээ.');
  };

  const updateUserRole = (userId: string, role: ManagedUser['role']) => {
    setUsers((current) =>
      current.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        return {
          ...user,
          role,
          notes: `${role === 'teacher' ? 'Багшийн' : 'Сурагчийн'} эрхээр шинэчиллээ.`,
        };
      })
    );
    setBanner('Хэрэглэгчийн эрх шинэчлэгдлээ.');
  };

  const toggleUserRestriction = (userId: string) => {
    setUsers((current) =>
      current.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        const nextStatus =
          user.accountStatus === 'restricted' ? 'active' : 'restricted';

        return {
          ...user,
          accountStatus: nextStatus,
          reason:
            nextStatus === 'active'
              ? 'Хязгаарлалт цуцлагдсан.'
              : 'Дүрмийн зөрчил шалгагдаж байна.',
        };
      })
    );
    setBanner('Хэрэглэгчийн хязгаарлалт шинэчлэгдлээ.');
  };

  const toggleUserBan = (userId: string) => {
    setUsers((current) =>
      current.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        const nextStatus = user.accountStatus === 'banned' ? 'active' : 'banned';

        return {
          ...user,
          accountStatus: nextStatus,
          reason:
            nextStatus === 'active'
              ? 'Блок тайлагдлаа.'
              : 'Админы шийдвэрээр түдгэлзүүллээ.',
        };
      })
    );
    setBanner('Хэрэглэгчийн түдгэлзүүлэлт шинэчлэгдлээ.');
  };

  const removeSpamClub = (clubId: string) => {
    const spamClub = spamQueue.find((item) => item.id === clubId);

    if (!spamClub) return;

    setSpamQueue((current) => current.filter((item) => item.id !== clubId));
    setBanner(`${spamClub.clubName} spam гэж устгагдлаа.`);
  };

  const pendingRequests = requests.filter(
    (request) => request.requestStatus === 'pending'
  );
  const activeCount = activeClubs.filter((club) => club.clubStatus === 'active')
    .length;
  const thresholdReachedCount = new Set(
    [...requests, ...activeClubs]
      .filter((club) => club.interestCount >= thresholdGoal)
      .map((club) => club.id)
  ).size;

  return {
    activeClubs,
    activeCount,
    approveRequest,
    banner,
    form,
    handleCreate,
    handleCreateUser,
    pendingRequests,
    rejectRequest,
    removeSpamClub,
    requests,
    spamQueue,
    resetUserForm,
    thresholdReachedCount,
    thresholdGoal,
    resetForm,
    updateUserField,
    toggleClubStatus,
    toggleUserBan,
    toggleUserRestriction,
    updateUserRole,
    userForm,
    users,
    updateField,
    formatThresholdLabel,
  };
}
