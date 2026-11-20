import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const upload = async (file) => {
  const storageRef = ref(getStorage(), `images/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

export default upload;
