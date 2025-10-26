import Lottie from "lottie-react";

const LottieAnimation = ({ animationData, loop = true, autoplay = true, className, ...props }) => {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
      {...props}
    />
  );
};

export default LottieAnimation;
