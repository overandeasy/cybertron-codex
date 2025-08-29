import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import {
  userProfileFormSchema,
  type UserProfile,
  type UserProfileFormData,
  SOCIAL_KEYS,
} from "~/lib/zod";
import { socialKeyLabel } from "~/lib/social";

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

type UserProfileFormProps = {
  userProfile: UserProfile;
  onSubmit: (data: UserProfileFormData) => void;
  isSubmitting: boolean;
};

export function UserProfileForm({
  userProfile,
  onSubmit,
  isSubmitting,
}: UserProfileFormProps) {
  const sortedSocialKeys = [...SOCIAL_KEYS].sort((a, b) => a.localeCompare(b)); // Ensure keys are sorted for consistent rendering

  const navigate = useNavigate();

  //   console.log("User profile in UserProfileForm:", userProfile);
  //   console.log("userProfile.social_links:", userProfile.social_links);

  const form = useForm<UserProfileFormData>({
    // Cast resolver to any to avoid TS incompatibilities between resolver types
    resolver: zodResolver(userProfileFormSchema) as any,
    defaultValues: {
      first_name: userProfile.first_name ?? "",
      last_name: userProfile.last_name ?? "",
      newImage: undefined, // Assuming image is handled separately
      country: userProfile.country ?? undefined,
      languages: userProfile.languages ?? [],
      faction: userProfile.faction ?? undefined,
      species: userProfile.species ?? "Terran",
      bio: userProfile.bio ?? "",
      social_links: userProfile.social_links ?? [{ key: "website", value: "" }],
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        first_name: userProfile.first_name ?? "",
        last_name: userProfile.last_name ?? "",
        newImage: undefined,
        country: userProfile.country ?? undefined,
        languages:
          userProfile.languages?.sort((a, b) => a.name.localeCompare(b.name)) ??
          [], // Sort languages by name for consistency
        faction: userProfile.faction ?? undefined,
        species: userProfile.species ?? "Terran",
        bio: userProfile.bio ?? "",
        social_links: userProfile.social_links?.sort((a, b) =>
          a.key.localeCompare(b.key)
        ) ?? [{ key: "website", value: "" }], // Sort social links by key so it appears consistent.
      });
    }
  }, [userProfile, form.reset]);

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your first name" {...field} />
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
                  <Input placeholder="Your last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Species</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
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
        </div>

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
                <Textarea placeholder="Your bio..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
          <div className="space-y-2">
            <FormLabel>Languages</FormLabel>
            {languageFields.map((item, index) => (
              <FormField
                key={item.id}
                control={form.control}
                name={`languages.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Input {...field} placeholder={`Language ${index + 1}`} />
                    </FormControl>
                    <Button
                      variant="ghost"
                      type="button"
                      size="icon"
                      onClick={() => removeLanguage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              // variant="theme_autobot"
              size="sm"
              onClick={() => appendLanguage({ name: "" })}
            >
              Add Language
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <FormLabel>Social Media</FormLabel>
          {socialLinkFields.map((item, index) => (
            <div className="grid grid-cols-6 gap-2 items-center" key={item.id}>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name={`social_links.${index}.key`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sortedSocialKeys.map((key) => (
                            <SelectItem key={key} value={key}>
                              {socialKeyLabel(key)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name={`social_links.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <Input {...field} placeholder="https://..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  variant="ghost"
                  type="button"
                  size="icon"
                  onClick={() => removeSocialLink(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            // variant="theme_autobot"
            size="sm"
            onClick={() => appendSocialLink({ key: "website", value: "" })}
          >
            Add Social Link
          </Button>
        </div>

        <div className="flex flex-col gap-2 pt-4">
          <Button
            // variant={"theme_autobot"}
            className="w-full"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </Button>
          <Button
            className="w-full"
            type="button"
            // variant="theme_decepticon"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
