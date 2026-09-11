import { useRef } from 'react';
import { LibraryBig } from 'lucide-react';

/* ============================================================
   Mouth — animated SVG mouth for expressive characters
   ============================================================ */
function Mouth({ type = 'none', width = 24, fill = '#2D2D2D' }) {
  const props = { width, height: type === 'open' ? 12 : 6, viewBox: '0 0 24 12' };

  if (type === 'none') return null;
  if (type === 'smile')
    return (
      <svg {...props} className="transition-all duration-300">
        <path d="M4 8 Q12 14 20 8" stroke={fill} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  if (type === 'frown')
    return (
      <svg {...props} className="transition-all duration-300">
        <path d="M4 6 Q12 0 20 6" stroke={fill} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  if (type === 'open')
    return (
      <svg {...props} className="transition-all duration-300">
        <ellipse cx="12" cy="6" rx="6" ry="5" fill={fill} />
      </svg>
    );
  return null;
}

/* ============================================================
   Pupil — small dot inside an eye that follows the cursor
   ============================================================ */
function Pupil({
  size = 12,
  maxDistance = 5,
  pupilColor = 'black',
  forceLookX,
  forceLookY,
  mouseX,
  mouseY,
}) {
  const pupilRef = useRef(null);

  const calcPos = () => {
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    if (!pupilRef.current) return { x: 0, y: 0 };

    const rect = pupilRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const angle = Math.atan2(dy, dx);

    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
    };
  };

  const pos = calcPos();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: pupilColor,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
}

/* ============================================================
   EyeBall — eye shape with a moving pupil
   ============================================================ */
function EyeBall({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = 'white',
  pupilColor = 'black',
  isBlinking = false,
  isWide = false,     // emotional: wider eyes
  forceLookX,
  forceLookY,
  mouseX,
  mouseY,
}) {
  const eyeRef = useRef(null);

  const calcPupilPos = () => {
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    if (!eyeRef.current) return { x: 0, y: 0 };

    const rect = eyeRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const angle = Math.atan2(dy, dx);

    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
    };
  };

  const pupilPos = calcPupilPos();
  const eyeSize = isBlinking ? 2 : isWide ? size * 1.25 : size;

  return (
    <div
      ref={eyeRef}
      className="flex items-center justify-center rounded-full transition-all duration-200"
      style={{
        width: eyeSize,
        height: eyeSize,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: pupilSize,
            height: pupilSize,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   AnimatedCharacters — scene with 4 character blocks
   (purple, black, orange, yellow) that react to user input
   ============================================================ */
export default function AnimatedCharacters({
  mouseX,
  mouseY,
  isLookingAtEachOther,
  isPurplePeeking,
  isPurpleBlinking,
  isBlackBlinking,
  isHiding,
  isPeeking,
  emotion = 'idle',         // 'idle' | 'error' | 'success'
  timeFilter = 'none',      // CSS filter for time-of-day
}) {
  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const yellowRef = useRef(null);
  const orangeRef = useRef(null);

  /* ---- map emotion to mouth/eye states ---- */
  const mouthType = emotion === 'error' ? 'frown' : emotion === 'success' ? 'smile' : 'none';
  const isWideEye = emotion === 'error';
  const isNodding = emotion === 'success';

  /* ---- calculate position relative to cursor ---- */
  const calcPos = (ref) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 3;
    const dx = mouseX - cx;
    const dy = mouseY - cy;

    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const purplePos = calcPos(purpleRef);
  const blackPos = calcPos(blackRef);
  const yellowPos = calcPos(yellowRef);
  const orangePos = calcPos(orangeRef);

  return (
    <>
      {/* ---- Brand ---- */}
      <div className="relative z-20">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <div className="flex size-8 items-center justify-center rounded-lg bg-black/5 backdrop-blur-sm">
            <LibraryBig className="size-4" />
          </div>
          <span>E-Library</span>
        </div>
      </div>

      {/* ---- Character scene ---- */}
      <div className="relative z-20 flex h-[500px] items-end justify-center">
        <div
          className="relative"
          style={{ width: 550, height: 400, filter: timeFilter }}
        >
          {/* ======== Purple (back-left) ======== */}
          <div
            ref={purpleRef}
            className={`absolute bottom-0 transition-all duration-700 ease-in-out ${
              emotion === 'idle' ? 'animate-float' : ''
            }`}
            style={{
              left: 70,
              width: 180,
              height: isHiding ? 440 : 400,
              backgroundColor: '#6C3FF5',
              borderRadius: '10px 10px 0 0',
              zIndex: 1,
              transform: isPeeking
                ? 'skewX(0deg)'
                : isHiding
                  ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                  : `skewX(${purplePos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
              animationDelay: '0s',
            }}
          >
            <div
              className="absolute flex gap-8 transition-all duration-700 ease-in-out"
              style={{
                left: isPeeking
                  ? 20
                  : isLookingAtEachOther
                    ? 55
                    : 45 + (purplePos.faceX || 0),
                top: isPeeking
                  ? 35
                  : isLookingAtEachOther
                    ? 65
                    : 40 + (purplePos.faceY || 0),
              }}
            >
              <EyeBall
                size={18}
                pupilSize={7}
                maxDistance={5}
                eyeColor="white"
                pupilColor="#2D2D2D"
                isBlinking={isPurpleBlinking}
                isWide={isWideEye}
                mouseX={mouseX}
                mouseY={mouseY}
                forceLookX={
                  isPeeking
                    ? isPurplePeeking
                      ? 4
                      : -4
                    : isLookingAtEachOther
                      ? 3
                      : undefined
                }
                forceLookY={
                  isPeeking
                    ? isPurplePeeking
                      ? 5
                      : -4
                    : isLookingAtEachOther
                      ? 4
                      : undefined
                }
              />
              <EyeBall
                size={18}
                pupilSize={7}
                maxDistance={5}
                eyeColor="white"
                pupilColor="#2D2D2D"
                isBlinking={isPurpleBlinking}
                isWide={isWideEye}
                mouseX={mouseX}
                mouseY={mouseY}
                forceLookX={
                  isPeeking
                    ? isPurplePeeking
                      ? 4
                      : -4
                    : isLookingAtEachOther
                      ? 3
                      : undefined
                }
                forceLookY={
                  isPeeking
                    ? isPurplePeeking
                      ? 5
                      : -4
                    : isLookingAtEachOther
                      ? 4
                      : undefined
                }
              />
            </div>
          </div>

          {/* ======== Black (back-right) ======== */}
          <div
            ref={blackRef}
            className={`absolute bottom-0 transition-all duration-700 ease-in-out ${
              emotion === 'idle' ? 'animate-float' : ''
            }`}
            style={{
              left: 240,
              width: 120,
              height: 310,
              backgroundColor: '#2D2D2D',
              borderRadius: '8px 8px 0 0',
              zIndex: 2,
              transform: isPeeking
                ? 'skewX(0deg)'
                : isLookingAtEachOther
                  ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                  : isHiding
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                    : `skewX(${blackPos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
              animationDelay: '0.3s',
            }}
          >
            <div
              className="absolute flex gap-6 transition-all duration-700 ease-in-out"
              style={{
                left: isPeeking
                  ? 10
                  : isLookingAtEachOther
                    ? 32
                    : 26 + (blackPos.faceX || 0),
                top: isPeeking
                  ? 28
                  : isLookingAtEachOther
                    ? 12
                    : 32 + (blackPos.faceY || 0),
              }}
            >
              <EyeBall
                size={16}
                pupilSize={6}
                maxDistance={4}
                eyeColor="white"
                pupilColor="#2D2D2D"
                isBlinking={isBlackBlinking}
                isWide={isWideEye}
                mouseX={mouseX}
                mouseY={mouseY}
                forceLookX={
                  isPeeking ? -4 : isLookingAtEachOther ? 0 : undefined
                }
                forceLookY={
                  isPeeking ? -4 : isLookingAtEachOther ? -4 : undefined
                }
              />
              <EyeBall
                size={16}
                pupilSize={6}
                maxDistance={4}
                eyeColor="white"
                pupilColor="#2D2D2D"
                isBlinking={isBlackBlinking}
                isWide={isWideEye}
                mouseX={mouseX}
                mouseY={mouseY}
                forceLookX={
                  isPeeking ? -4 : isLookingAtEachOther ? 0 : undefined
                }
                forceLookY={
                  isPeeking ? -4 : isLookingAtEachOther ? -4 : undefined
                }
              />
            </div>
          </div>

          {/* ======== Orange (front-left) ======== */}
          <div
            ref={orangeRef}
            className={`absolute bottom-0 transition-all duration-700 ease-in-out ${
              emotion === 'idle' ? 'animate-sway' : ''
            }`}
            style={{
              left: 0,
              width: 240,
              height: 200,
              zIndex: 3,
              backgroundColor: '#FF9B6B',
              borderRadius: '120px 120px 0 0',
              transform: isPeeking
                ? 'skewX(0deg)'
                : `skewX(${orangePos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
              animationDelay: '0.1s',
            }}
          >
            {/* Eyes */}
            <div
              className="absolute flex gap-8 transition-all duration-200 ease-out"
              style={{
                left: isPeeking ? 50 : 82 + (orangePos.faceX || 0),
                top: isPeeking ? 85 : 90 + (orangePos.faceY || 0),
              }}
            >
              <Pupil
                size={12}
                maxDistance={5}
                pupilColor="#2D2D2D"
                mouseX={mouseX}
                mouseY={mouseY}
                forceLookX={isPeeking ? -5 : undefined}
                forceLookY={isPeeking ? -4 : undefined}
              />
              <Pupil
                size={12}
                maxDistance={5}
                pupilColor="#2D2D2D"
                mouseX={mouseX}
                mouseY={mouseY}
                forceLookX={isPeeking ? -5 : undefined}
                forceLookY={isPeeking ? -4 : undefined}
              />
            </div>

            {/* Mouth */}
            <div
              className="absolute"
              style={{
                left: isPeeking ? 50 : 100 + (orangePos.faceX || 0),
                top: isPeeking ? 118 : 122 + (orangePos.faceY || 0),
              }}
            >
              <Mouth type={mouthType} width={28} fill="#2D2D2D" />
            </div>
          </div>

          {/* ======== Yellow (front-right) ======== */}
          <div
            ref={yellowRef}
            className={`absolute bottom-0 transition-all duration-700 ease-in-out ${
              emotion === 'idle' ? 'animate-sway' : ''
            }`}
            style={{
              left: 310,
              width: 140,
              height: 230,
              backgroundColor: '#E8D754',
              borderRadius: '70px 70px 0 0',
              zIndex: 4,
              transform: isPeeking
                ? 'skewX(0deg)'
                : `skewX(${yellowPos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
              animationDelay: '0.2s',
            }}
          >
            {/* Eyes */}
            <div
              className="absolute flex gap-6 transition-all duration-200 ease-out"
              style={{
                left: isPeeking ? 20 : 52 + (yellowPos.faceX || 0),
                top: isPeeking ? 35 : 40 + (yellowPos.faceY || 0),
              }}
            >
              <Pupil
                size={12}
                maxDistance={5}
                pupilColor="#2D2D2D"
                mouseX={mouseX}
                mouseY={mouseY}
                forceLookX={isPeeking ? -5 : undefined}
                forceLookY={isPeeking ? -4 : undefined}
              />
              <Pupil
                size={12}
                maxDistance={5}
                pupilColor="#2D2D2D"
                mouseX={mouseX}
                mouseY={mouseY}
                forceLookX={isPeeking ? -5 : undefined}
                forceLookY={isPeeking ? -4 : undefined}
              />
            </div>

            {/* Mouth — permanent horizontal bar (original design) */}
            <div
              className="absolute h-[4px] rounded-full bg-[#2D2D2D] transition-all duration-200 ease-out"
              style={{
                width: 60,
                left: isPeeking ? 28 : 50 + (yellowPos.faceX || 0),
                top: isPeeking ? 72 : 76 + (yellowPos.faceY || 0),
              }}
            />
          </div>
        </div>
      </div>

      {/* ---- Background effects ---- */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="absolute right-1/4 top-1/4 size-64 rounded-full bg-black/[0.04] blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 size-96 rounded-full bg-black/5 blur-3xl" />
    </>
  );
}
