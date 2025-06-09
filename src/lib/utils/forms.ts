export function formDataToObject(formData: FormData) {
  const object: Record<string, string | (string | File)[] | File> = {};
  for (const [key, value] of formData.entries()) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      if (Array.isArray(object[key])) {
        object[key].push(value);
      } else {
        object[key] = [object[key], value];
      }
      continue;
    }
    object[key] = value;
  }
  return object;
}
