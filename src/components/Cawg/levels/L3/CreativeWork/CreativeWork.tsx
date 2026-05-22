import React from "react";
import { Manifest } from 'c2pa-react-component-types';
import KeyValueDisplayer from "./KeyValueDisplayer";

export interface CreativeWorkProps {
  manifest: Manifest;
}

const formatSchemaObject = (obj: any): string => {
  if (typeof obj === 'string') return obj;
  if (obj?.name) return obj.name;
  return typeof obj === 'object' ? JSON.stringify(obj) : String(obj);
};

const formatValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined) return null;
  
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return value.map(item => formatSchemaObject(item)).join(", ");
  }
  
  if (typeof value === 'object') {
    return formatSchemaObject(value);
  }
  
  return String(value);
};

export default function CreativeWork({ manifest }: CreativeWorkProps) {
  const creativeWork = manifest.assertions?.["stds.schema-org.CreativeWork"];

  if (!creativeWork) return null;

  // Comprehensive list of CreativeWork fields based on Schema.org
  const fields = [
    { key: 'name', label: 'Name' },
    { key: 'abstract', label: 'Abstract' },
    { key: 'accessMode', label: 'Access Mode' },
    { key: 'accessModeSufficient', label: 'Access Mode Sufficient' },
    { key: 'accessibilityAPI', label: 'Accessibility API' },
    { key: 'accessibilityControl', label: 'Accessibility Control' },
    { key: 'accessibilityFeature', label: 'Accessibility Feature' },
    { key: 'accessibilityHazard', label: 'Accessibility Hazard' },
    { key: 'accessibilitySummary', label: 'Accessibility Summary' },
    { key: 'accountablePerson', label: 'Accountable Person' },
    { key: 'aggregateRating', label: 'Aggregate Rating' },
    { key: 'alternativeHeadline', label: 'Alternative Headline' },
    { key: 'archivedAt', label: 'Archived At' },
    { key: 'assesses', label: 'Assesses' },
    { key: 'associatedMedia', label: 'Associated Media' },
    { key: 'audience', label: 'Audience' },
    { key: 'audio', label: 'Audio' },
    { key: 'author', label: 'Author' },
    { key: 'award', label: 'Award' },
    { key: 'awards', label: 'Awards' },
    { key: 'character', label: 'Character' },
    { key: 'citation', label: 'Citation' },
    { key: 'comment', label: 'Comment' },
    { key: 'commentCount', label: 'Comment Count' },
    { key: 'conditionsOfAccess', label: 'Conditions Of Access' },
    { key: 'contentLocation', label: 'Content Location' },
    { key: 'contentRating', label: 'Content Rating' },
    { key: 'contentReferenceTime', label: 'Content Reference Time' },
    { key: 'contributor', label: 'Contributor' },
    { key: 'copyrightHolder', label: 'Copyright Holder' },
    { key: 'copyrightYear', label: 'Copyright Year' },
    { key: 'correction', label: 'Correction' },
    { key: 'countryOfOrigin', label: 'Country Of Origin' },
    { key: 'creator', label: 'Creator' },
    { key: 'dateCreated', label: 'Date Created' },
    { key: 'dateModified', label: 'Date Modified' },
    { key: 'datePublished', label: 'Date Published' },
    { key: 'description', label: 'Description' },
    { key: 'disambiguatingDescription', label: 'Disambiguating Description' },
    { key: 'discussionUrl', label: 'Discussion URL' },
    { key: 'editor', label: 'Editor' },
    { key: 'educationalAlignment', label: 'Educational Alignment' },
    { key: 'educationalLevel', label: 'Educational Level' },
    { key: 'educationalUse', label: 'Educational Use' },
    { key: 'encoding', label: 'Encoding' },
    { key: 'encodingFormat', label: 'Encoding Format' },
    { key: 'encodings', label: 'Encodings' },
    { key: 'exampleOfWork', label: 'Example Of Work' },
    { key: 'expires', label: 'Expires' },
    { key: 'fileFormat', label: 'File Format' },
    { key: 'funder', label: 'Funder' },
    { key: 'genre', label: 'Genre' },
    { key: 'hasPart', label: 'Has Part' },
    { key: 'headline', label: 'Headline' },
    { key: 'inLanguage', label: 'In Language' },
    { key: 'interactionStatistic', label: 'Interaction Statistic' },
    { key: 'interactivityType', label: 'Interactivity Type' },
    { key: 'isAccessibleForFree', label: 'Is Accessible For Free' },
    { key: 'isBasedOn', label: 'Is Based On' },
    { key: 'isBasedOnUrl', label: 'Is Based On URL' },
    { key: 'isFamilyFriendly', label: 'Is Family Friendly' },
    { key: 'isPartOf', label: 'Is Part Of' },
    { key: 'keywords', label: 'Keywords' },
    { key: 'learningResourceType', label: 'Learning Resource Type' },
    { key: 'license', label: 'License' },
    { key: 'locationCreated', label: 'Location Created' },
    { key: 'mainEntity', label: 'Main Entity' },
    { key: 'material', label: 'Material' },
    { key: 'mentions', label: 'Mentions' },
    { key: 'offers', label: 'Offers' },
    { key: 'position', label: 'Position' },
    { key: 'producer', label: 'Producer' },
    { key: 'provider', label: 'Provider' },
    { key: 'publication', label: 'Publication' },
    { key: 'publisher', label: 'Publisher' },
    { key: 'publishingPrinciples', label: 'Publishing Principles' },
    { key: 'recordedAt', label: 'Recorded At' },
    { key: 'releasedEvent', label: 'Released Event' },
    { key: 'review', label: 'Review' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'schemaVersion', label: 'Schema Version' },
    { key: 'sdDatePublished', label: 'SD Date Published' },
    { key: 'sdLicense', label: 'SD License' },
    { key: 'sdPublisher', label: 'SD Publisher' },
    { key: 'size', label: 'Size' },
    { key: 'sourceOrganization', label: 'Source Organization' },
    { key: 'spatialCoverage', label: 'Spatial Coverage' },
    { key: 'sponsor', label: 'Sponsor' },
    { key: 'teaches', label: 'Teaches' },
    { key: 'temporalCoverage', label: 'Temporal Coverage' },
    { key: 'text', label: 'Text' },
    { key: 'thumbnailUrl', label: 'Thumbnail URL' },
    { key: 'timeRequired', label: 'Time Required' },
    { key: 'translationOfWork', label: 'Translation Of Work' },
    { key: 'translator', label: 'Translator' },
    { key: 'typicalAgeRange', label: 'Typical Age Range' },
    { key: 'usageInfo', label: 'Usage Info' },
    { key: 'version', label: 'Version' },
    { key: 'video', label: 'Video' },
    { key: 'workExample', label: 'Work Example' },
    { key: 'workTranslation', label: 'Work Translation' },
  ];

  return (
    <>
      {fields.map((field) => {
        const value = creativeWork[field.key as keyof typeof creativeWork];
        const displayValue = formatValue(value);
        
        if (!displayValue) return null;

        return (
          <KeyValueDisplayer 
            key={field.key} 
            label={field.label} 
            value={displayValue} 
          />
        );
      })}
    </>
  );
}
