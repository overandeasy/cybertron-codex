import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useRouteLoaderData } from "react-router";
import {
  userProfileFormSchema,
  type UserProfile,
  type UserProfileFormData,
} from "~/lib/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, X } from "lucide-react";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SOCIAL_KEYS } from "~/lib/zod";

// 1. Add props to communicate with the parent
type UserProfileFormProps = {
  userProfile: UserProfile;
  onNewImageSelect: (file: File | undefined) => void;
};
export function UserProfileForm({
  userProfile,
  onNewImageSelect,
}: UserProfileFormProps) {
  [...SOCIAL_KEYS].sort((a, b) => a.localeCompare(b)); // Ensure keys are sorted for consistent rendering
  const loaderData = useRouteLoaderData("routes/appLayout");
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>();

  console.log("User profile in UserProfileForm:", userProfile);
  console.log("userProfile.social_links:", userProfile.social_links);

  // 1. Transform the social links data
  const transformedSocialLinks = userProfile.social_links
    ?.map((link) => {
      const key = Object.keys(link)[0] as (typeof SOCIAL_KEYS)[number];
      const value = Object.values(link)[0];
      return { key, value };
    })
    .sort((a, b) => a.key.localeCompare(b.key));

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      first_name: userProfile.first_name ?? "",
      last_name: userProfile.last_name ?? "",
      newImage: undefined, // Assuming image is handled separately
      country: userProfile.country ?? undefined,
      languages: userProfile.languages ?? [],
      faction: userProfile.faction ?? undefined,
      species: userProfile.species ?? "Terran",
      bio: userProfile.bio ?? "",
      social_links: transformedSocialLinks ?? [{ key: undefined, value: "" }],
    },
  });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  const {
    fields: socialLinkFields,
    append: appendSocialLink,
    remove: removeSocialLink,
  } = useFieldArray({
    control: form.control,
    name: "social_links",
  });

  const handleImageField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    form.setValue("newImage", file, { shouldValidate: true });
    // 4. Notify the parent component about the new file
    onNewImageSelect(file);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => console.log(data))}
        className="space-y-4 w-full "
      >
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a species" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(
                    userProfileFormSchema.shape.species.unwrap()
                      .options as string[]
                  ).map((species) => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="faction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faction</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a faction" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(
                    userProfileFormSchema.shape.faction.unwrap()
                      .options as string[]
                  ).map((faction) => (
                    <SelectItem key={faction} value={faction}>
                      {faction}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormDescription>
                Tell others a bit about yourself.
              </FormDescription>
              <FormControl>
                <Textarea placeholder="" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(
                    userProfileFormSchema.shape.country.unwrap()
                      .options as string[]
                  ).map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLabel className="mb-2">Languages</FormLabel>
        <FormDescription></FormDescription>
        {languageFields.map((item, index) => (
          <FormField
            key={item.id}
            control={form.control}
            name={`languages.${index}.name` as const}
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl className="flex-1">
                  <Input {...field} placeholder={`Language ${index + 1}`} />
                </FormControl>
                <Button
                  variant="ghost"
                  type="button"
                  size="sm"
                  onClick={() => removeLanguage(index)}
                >
                  <X strokeWidth="4" className="" />
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => appendLanguage({ name: "" })}
          >
            <Plus strokeWidth="4" className="" />
          </Button>
        </div>

        <FormLabel className="mb-2">Social Media</FormLabel>
        <FormDescription></FormDescription>
        {socialLinkFields.map((item, index) => (
          <div className="grid grid-cols-6 gap-2 items-center" key={item.id}>
            <div className="col-span-1">
              <FormField
                control={form.control}
                name={`social_links.${index}.key` as const}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl className="w-full">
                      <Select
                        onValueChange={field.onChange}
                        // value={`${Object.keys(item)[0]}`}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={`Social Media ${index + 1}`}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          {SOCIAL_KEYS.filter(
                            (key) =>
                              !form
                                .watch("social_links")
                                ?.some(
                                  (link, idx) =>
                                    link.key === key && idx !== index
                                )
                          ).map((key) => (
                            <SelectItem
                              key={key}
                              value={key}
                              className="w-full"
                            >
                              {key}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-4">
              <FormField
                key={`${item.id}-value`}
                control={form.control}
                name={`social_links.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl className="w-full">
                      <Input
                        {...field}
                        placeholder={`Social Media ${index + 1} Link`}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1 flex justify-end">
              <Button
                variant="ghost"
                type="button"
                size="sm"
                onClick={() => removeSocialLink(index)}
              >
                <X strokeWidth="4" className="" />
              </Button>
            </div>
          </div>
        ))}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => appendSocialLink({ key: "Other" as any, value: "" })}
          >
            <Plus strokeWidth="4" className="" />
          </Button>
        </div>

        <FormField
          control={form.control}
          name="newImage"
          render={() => (
            <FormItem>
              <FormLabel>Upload New Profile Image</FormLabel>
              <FormControl>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageField}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="w-full"
          disabled={form.formState.isSubmitting}
          type="submit"
        >
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </form>
    </Form>
  );
}
