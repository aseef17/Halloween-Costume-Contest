import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import Card from "../ui/Card";
import ErrorMessage from "../ui/ErrorMessage";
import CostumeSubmissionModal from "../ui/CostumeSubmissionModal";
import ImageUpload from "../ui/ImageUpload";
import CostumeService from "../../services/CostumeService";
import { useApp } from "../../hooks/useApp";
import { useCostumeOperations } from "../../hooks/useAsyncOperations";
import { costumeToasts, promiseToast } from "../../utils/toastUtils";

const CostumeForm = ({ costume = null, userId, onSuccess, onCancel }) => {
  const { user } = useApp();
  const [name, setName] = useState(costume?.name || "");
  const [description, setDescription] = useState(costume?.description || "");
  const [imageUrl, setImageUrl] = useState(costume?.imageUrl || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  const { isLoading, createCostume, updateCostume } = useCostumeOperations();

  const isEdit = !!costume;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Costume name is required");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (isUploadingImage) {
      setError("Please wait for image upload to complete");
      return;
    }

    setError("");

    try {
      const costumeData = { name, description, imageUrl };

      if (isEdit) {
        await promiseToast.costumeUpdate(
          updateCostume(costume.id, costumeData),
        );
        costumeToasts.updated();
        if (onSuccess) onSuccess();
      } else {
        await promiseToast.costumeSubmit(
          createCostume(costumeData, userId, user?.displayName),
        );
        setShowSubmissionModal(true);
      }
    } catch (error) {
      if (error.message.includes("already have a costume")) {
        costumeToasts.alreadyExists();
      } else {
        setError(error.message || "Failed to save costume. Please try again.");
      }
    }
  };

  return (
    <Card className="border-orange-400/50">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-orange-300">
            {isEdit ? "Edit Your Costume" : "Add Your Costume"}
          </h3>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="w-8 h-8 p-0 rounded-full flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {error && (
          <ErrorMessage message={error} variant="error" className="mb-4" />
        )}

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-orange-400">
            Costume Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a spooky name for your costume"
            className="w-full"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-orange-400">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your ghoulish creation..."
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500">
            Be creative but keep it friendly! Describe what makes your costume
            special.
          </p>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-orange-400">
            Costume Image (Optional)
          </label>
          <ImageUpload
            currentImageUrl={imageUrl}
            onImageUpload={(url) => {
              setImageUrl(url);
              setIsUploadingImage(false);
            }}
            onImageRemove={() => setImageUrl("")}
            onUploadStart={() => setIsUploadingImage(true)}
            disabled={isLoading}
            className="mb-2"
          />
          <p className="text-xs text-gray-500">
            Upload an image to showcase your costume. This will be visible to
            other users.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isUploadingImage}
            variant="default"
            animation="spooky"
            className="flex items-center gap-2 px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : isUploadingImage ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading Image...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Costume
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Costume Submission Modal */}
      <CostumeSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => {
          setShowSubmissionModal(false);
          if (onSuccess) onSuccess();
        }}
        costumeName={name}
      />
    </Card>
  );
};

export default CostumeForm;
