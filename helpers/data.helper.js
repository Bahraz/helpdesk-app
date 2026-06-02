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

module.exports = {
  mergeUserFormData,
};