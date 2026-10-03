const formatPartTimeStaffCreatedAt = (createdAt: string) =>
  createdAt.slice(0, 10).replaceAll('-', '. ');

export { formatPartTimeStaffCreatedAt };
