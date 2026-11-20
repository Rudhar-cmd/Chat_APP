import defaultAvatar from "../assets/default-avatar.svg";

const isLegacyPlaceholder = (src) => {
  if (typeof src !== "string") return false;
  const imagePath = src.split(/[?#]/, 1)[0];
  return /(?:^|\/)Profile(?:-[^/]+)?\.(?:png|jpg)$/i.test(imagePath);
};

export default function Avatar({ src, alt = "Profile", ...props }) {
  const imageSrc = src && !isLegacyPlaceholder(src) ? src : defaultAvatar;

  const handleError = (event) => {
    const image = event.currentTarget;
    image.onerror = null;
    image.src = defaultAvatar;
  };

  return <img src={imageSrc} alt={alt} onError={handleError} {...props} />;
}
