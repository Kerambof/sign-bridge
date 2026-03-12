class GestureRecognizer {
  constructor() {
    this.gestureHistory = [];
    this.historyLength = 5;
  }

  recognizeGesture(landmarks) {
    if (!landmarks || landmarks.length === 0) {
      return null;
    }

    // Emergency first
    if (this.isHelp(landmarks)) {
      return { gesture: 'HELP',  text: 'HELP' };
    }

    // Love gesture (both hands - wide hand shape)
    if (this.isLove(landmarks)) {
      return { gesture: 'LOVE',  text: 'I LOVE YOU' };
    }

    // OK gesture (check before thumbs up)
    if (this.isOK(landmarks)) {
      return { gesture: 'OK', text: 'OK' };
    }

    // Yes (thumbs up - now independent)
    if (this.isThumbsUp(landmarks)) {
      return { gesture: 'YES', text: 'YES' };
    }

    // No
    if (this.isThumbsDown(landmarks)) {
      return { gesture: 'NO',  text: 'NO' };
    }

    // Stop (check before Thank You)
    if (this.isStop(landmarks)) {
      return { gesture: 'STOP',  text: 'STOP' };
    }

    // Thank You
    if (this.isThankYou(landmarks)) {
      return { gesture: 'THANK_YOU',  text: 'THANK YOU' };
    }

    // Wave/Hello
    if (this.isWave(landmarks)) {
      return { gesture: 'WAVE',  text: 'HELLO' };
    }

    // Eat/Drink
    if (this.isEatDrink(landmarks)) {
      return { gesture: 'EAT_DRINK',  text: 'I WANT TO EAT ' };
    }

    return null;
  }

  // ─── Helpers ────────────────────────────────────────────────────

  getDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  isFingerExtended(tip, pip) {
  return tip.y < pip.y - 0.02;
}

  // ─── Gestures ────────────────────────────────────────────────────

  // 1. HELP - Hand raised high
  isHelp(landmarks) {
    const wrist = landmarks[0];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const pinkyTip = landmarks[20];

    const handRaised = wrist.y < 0.35;
    const indexUp = indexTip.y < wrist.y - 0.12;
    const middleUp = middleTip.y < wrist.y - 0.12;
    const spread = Math.abs(indexTip.x - pinkyTip.x) > 0.12;

    return handRaised && indexUp && middleUp && spread;
  }

  // 2. LOVE 🫶 - Heart hands
  // Both thumb and pinky extended, middle fingers curled
  // Like making a heart shape with one hand
  isLove(landmarks) {
    /*
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];
    const wrist = landmarks[0];

    // Thumb extended outward
    const thumbExtended = thumbTip.y < thumbIP.y ||
      Math.abs(thumbTip.x - wrist.x) > 0.15;

    // Pinky extended
    const pinkyExtended = pinkyTip.y < pinkyPIP.y;

    // Index and middle CURLED (key to heart shape)
    const indexCurled = indexTip.y > indexPIP.y;
    const middleCurled = middleTip.y > middlePIP.y;

    // Ring can be curled too
    const ringCurled = ringTip.y > ringPIP.y;

    // Thumb and pinky spread apart
    const thumbPinkyDist = this.getDistance(thumbTip, pinkyTip);
    const goodSpread = thumbPinkyDist > 0.2;

    return thumbExtended && pinkyExtended &&
      indexCurled && middleCurled &&
      ringCurled && goodSpread;
      */
  }

  // 3. OK 👌 - Circle with thumb + index, others extended
  isOK(landmarks) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];

    // Thumb and index touching/very close (forming circle)
    const thumbIndexDist = this.getDistance(thumbTip, indexTip);
    const formingCircle = thumbIndexDist < 0.06;

    // Other fingers extended (middle, ring, pinky up)
    const middleExtended = this.isFingerExtended(middleTip, middlePIP);
    const ringExtended = this.isFingerExtended(ringTip, ringPIP);
    const pinkyExtended = this.isFingerExtended(pinkyTip, pinkyPIP);

    // At least 2 of 3 remaining fingers extended
    const extendedCount = [middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

    return formingCircle && extendedCount >= 2;
  }

  // 4. YES 👍 - Thumbs up
  isThumbsUp(landmarks) {
    const thumbTip = landmarks[4];
    const thumbMCP = landmarks[2];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];
    const wrist = landmarks[0];

    const thumbToWristDist = this.getDistance(thumbTip, wrist);
    const thumbBaseDist = this.getDistance(thumbMCP, wrist);
    const thumbExtended = thumbToWristDist > thumbBaseDist;

    const indexCurled = indexTip.y > indexPIP.y;
    const middleCurled = middleTip.y > middlePIP.y;
    const ringCurled = ringTip.y > ringPIP.y;
    const pinkyCurled = pinkyTip.y > pinkyPIP.y;

    const curledCount = [indexCurled, middleCurled, ringCurled, pinkyCurled].filter(Boolean).length;
    const thumbIndexDist = this.getDistance(thumbTip, indexTip);

    // Make sure NOT forming OK circle
    const notOK = thumbIndexDist > 0.07;

    return thumbExtended && curledCount >= 3 && notOK;
  }

  // 5. NO 👎 - Thumbs down
  isThumbsDown(landmarks) {
    /*
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];
    const wrist = landmarks[0];

    const thumbPointingDown = thumbTip.y > wrist.y + 0.05;

    const indexCurled = indexTip.y > indexPIP.y;
    const middleCurled = middleTip.y > middlePIP.y;
    const ringCurled = ringTip.y > ringPIP.y;
    const pinkyCurled = pinkyTip.y > pinkyPIP.y;

    const curledCount = [indexCurled, middleCurled, ringCurled, pinkyCurled].filter(Boolean).length;

    return thumbPointingDown && curledCount >= 3;
    */
  }

  // 6. STOP ✋ - Open palm, fingers together
  isStop(landmarks) {
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const indexMCP = landmarks[5];
    const middleMCP = landmarks[9];
    const wrist = landmarks[0];

    const indexExtended = this.isFingerExtended(indexTip, indexMCP);
    const middleExtended = this.isFingerExtended(middleTip, middleMCP);
    const ringExtended = ringTip.y < wrist.y;
    const pinkyExtended = pinkyTip.y < wrist.y;

    const fingerSpread = Math.abs(indexTip.x - pinkyTip.x);
    const fingersTogether = fingerSpread < 0.13;

    const handUpright = indexTip.y < wrist.y - 0.1;

    return indexExtended && middleExtended && ringExtended &&
      pinkyExtended && fingersTogether && handUpright;
  }

  // 7. THANK YOU 🙏 - Prayer position, centered
  isThankYou(landmarks) {
    /*
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const wrist = landmarks[0];

    // All fingers extended and pointing upward
    const indexExtended = indexTip.y < wrist.y - 0.1;
    const middleExtended = middleTip.y < wrist.y - 0.1;
    const ringExtended = ringTip.y < wrist.y - 0.1;
    const pinkyExtended = pinkyTip.y < wrist.y - 0.1;

    // Fingers close together (praying position)
    const fingerSpread = Math.abs(indexTip.x - pinkyTip.x);
    const fingersTogether = fingerSpread < 0.1;

    // Hand centered (not tilted left or right much)
    const centered = Math.abs(wrist.x - 0.5) < 0.3;

    return indexExtended && middleExtended && ringExtended && pinkyExtended && fingersTogether && centered;
    */
  }


  // 8. WAVE 👋 - Open palm, fingers spread
  isWave(landmarks) {
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const indexMCP = landmarks[5];
    const pinkyMCP = landmarks[17];

    const indexExtended = this.isFingerExtended(indexTip, indexMCP);
    const middleExtended = this.isFingerExtended(middleTip, indexMCP);
    const ringExtended = this.isFingerExtended(ringTip, pinkyMCP);
    const pinkyExtended = this.isFingerExtended(pinkyTip, pinkyMCP);

    const fingerSpread = Math.abs(indexTip.x - pinkyTip.x);
    const fingersSpread = fingerSpread > 0.15;

    const palmFacing = Math.abs(indexTip.z - pinkyTip.z) < 0.08;

    return indexExtended && middleExtended && ringExtended &&
      pinkyExtended && fingersSpread && palmFacing;
  }

  // 9. EAT/DRINK - Hand near mouth
  isEatDrink(landmarks) {
    /*
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const wrist = landmarks[0];

    const thumbIndexDist = this.getDistance(thumbTip, indexTip);
    const fingersPinched = thumbIndexDist < 0.1;

    const nearFace = wrist.y < 0.45 && indexTip.y < 0.4;
    const forward = wrist.z < -0.02;

    return (fingersPinched || thumbIndexDist < 0.15) && nearFace && forward;
    */
  }

  // Smooth gesture detection
  smoothGesture(currentGesture) {
    this.gestureHistory.push(currentGesture);

    if (this.gestureHistory.length > this.historyLength) {
      this.gestureHistory.shift();
    }

    const gestureCounts = {};
    this.gestureHistory.forEach(g => {
      if (g) {
        gestureCounts[g.gesture] = (gestureCounts[g.gesture] || 0) + 1;
      }
    });

    let maxCount = 0;
    let dominantGesture = null;

    for (const [gesture, count] of Object.entries(gestureCounts)) {
      if (count > maxCount && count >= 3) {
        maxCount = count;
        dominantGesture = this.gestureHistory.find(g => g && g.gesture === gesture);
      }
    }

    return dominantGesture;
  }
}

export default GestureRecognizer;

