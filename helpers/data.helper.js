function mergeUserFormData(user, formData) {
  return {
    ...user,
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    role_id: formData.roleId,
    department_id: formData.departmentId,
    is_active: formData.isActive,
  };
}

function mapSessionUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    roleId: user.role_id,
    roleName: user.role_name,
    role: mapUserRole(user.role_name),
    departmentId: user.department_id,
    departmentName: user.department_name,
  }
}

function mapUserRole(roleName) {
  if (!roleName) {
    return null;
  }

  const normalizedRole = roleName.toLowerCase();

  switch (normalizedRole) {
    case "admin":
      return "admin";
    case "requestor":
      return "requestor";
    case "agent":
      return "agent";
    default:
      return null;
  }
}

module.exports = {
  mergeUserFormData,
  mapSessionUser
};