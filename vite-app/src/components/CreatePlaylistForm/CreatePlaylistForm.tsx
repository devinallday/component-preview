import React, { useState } from "react";

interface CreatePlaylistFormProps {
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}

const MAX_NAME_LENGTH = 50;

const CreatePlaylistForm: React.FC<CreatePlaylistFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmedName = name.trim();
  const isEmpty = trimmedName.length === 0;
  const isTooLong = trimmedName.length > MAX_NAME_LENGTH;
  const isValid = !isEmpty && !isTooLong;

  const errorMessage = isEmpty
    ? "Playlist name is required"
    : isTooLong
      ? `Name must be ${MAX_NAME_LENGTH} characters or fewer`
      : "";

  const showError = touched && !isValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onSubmit(trimmedName, description.trim());
  };

  return (
    <form
      className="flex flex-col gap-4 p-4 bg-spotify-gray-900 rounded-lg w-96 max-w-full"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="text-white text-lg font-bold">Create playlist</h2>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="playlist-name"
          className="text-spotify-gray-300 text-xs"
        >
          Name
        </label>
        <input
          id="playlist-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="My Playlist"
          className="px-3 py-2 rounded-md bg-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-spotify-green"
        />
        {showError && (
          <p className="text-red-400 text-xs" role="alert">
            {errorMessage}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="playlist-description"
          className="text-spotify-gray-300 text-xs"
        >
          Description (optional)
        </label>
        <textarea
          id="playlist-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add an optional description"
          rows={3}
          className="px-3 py-2 rounded-md bg-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-spotify-green resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full text-white text-sm hover:bg-white/10 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="px-4 py-2 rounded-full bg-spotify-green text-black text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200"
        >
          Create playlist
        </button>
      </div>
    </form>
  );
};

export default CreatePlaylistForm;
