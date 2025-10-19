// React import for component functionality
import React from "react";
// Avatar image assets - three different character options
import Avatar1 from "../assets/avatars/avatar1.png";
import Avatar2 from "../assets/avatars/avatar2.png";
import Avatar3 from "../assets/avatars/avatar3.png";
// Component-specific styles
import "../css/CharacterCustomiser.css";

// Props interface defining the data and callbacks this component expects
interface Props {
  avatar: string; // Currently selected avatar ID
  setAvatar: (a: string) => void; // Callback to update selected avatar
  color: string; // Currently selected background color
  setColor: (c: string) => void; // Callback to update selected color
}

// Available avatar options - maps IDs to their corresponding image assets
const avatars = [
  { id: "a1", src: Avatar1 },
  { id: "a2", src: Avatar2 },
  { id: "a3", src: Avatar3 },
];

// Available background color options for avatar customization
// Colors chosen to provide good contrast and visual appeal
const colors = ["#FFD166", "#06D6A0", "#118AB2", "#EF476F"];

/**
 * CharacterCustomizer component allows users to select an avatar and background color
 * Used in player setup to personalize their game appearance
 *
 * @param avatar - Currently selected avatar ID
 * @param setAvatar - Function to update the selected avatar
 * @param color - Currently selected background color (hex code)
 * @param setColor - Function to update the selected background color
 */
const CharacterCustomizer: React.FC<Props> = ({
  avatar,
  setAvatar,
  color,
  setColor,
}) => {
  return (
    <div className="customizer">
      {/* Header Labels Section - Two separate cells for avatar and color labels */}
      <div className="label-cell avatar-label">
        <div className="customizer-label">Choose avatar</div>
      </div>
      <div className="label-cell color-label">
        <div className="customizer-label">Choose color</div>
      </div>

      {/* Controls Section - Interactive elements for selection */}

      {/* Avatar Selection Grid */}
      <div className="controls-cell avatar-controls">
        <div className="avatar-grid">
          {/* Map through available avatars and create clickable buttons */}
          {avatars.map((a) => (
            <button
              key={a.id}
              className={`avatar-btn ${avatar === a.id ? "selected" : ""}`}
              onClick={() => setAvatar(a.id)}
              type="button"
              // Apply selected color as background when this avatar is chosen
              style={{
                backgroundColor: avatar === a.id ? color : "transparent",
              }}
              aria-label={`Choose ${a.id}`}
            >
              <img src={a.src} alt={a.id} />
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection Grid */}
      <div className="controls-cell color-controls">
        <div className="color-grid">
          {/* Map through available colors and create clickable color swatches */}
          {colors.map((c) => (
            <button
              key={c}
              className={`color-swatch ${color === c ? "selected" : ""}`}
              style={{ backgroundColor: c }} // Display the actual color as background
              onClick={() => setColor(c)}
              type="button"
              aria-label={`Choose color ${c}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterCustomizer;
