import './live-animation.scss';

export default function LiveAnimation() {
  return (
    <div className="fs-3 m-2 position-relative">
      {/* <i className="bi-globe-americas"></i> */}
      <img src="/live-location-logo.svg" width="50" />
      <i
        className="bi-circle position-absolute pulsating text-center"
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      ></i>
    </div>
  );
}
