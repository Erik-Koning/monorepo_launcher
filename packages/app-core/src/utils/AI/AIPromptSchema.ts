import { TemplateData } from "@/packages/common/src/types/formGenerator";
//import { TemplateSchemaForAI, TSFAString } from "@/src/lib/server/workers/longRunningAIResponse";

//build a schema that chatgpt expects for structured outputs. template is our form teplate, currentfields, and usereditedfields (current value) is .edited
export const convertTemplateToSchemaForAI = (
  template: TemplateData["tabs"],
  currentFields?: Record<string, any>,
  userEditedFields?: Record<string, any>,
  allowDescriptions = true
): any => {
  // Initialize the schema object
  const schema: any = {
    type: "object",
    properties: {},
    required: [],
    additionalProperties: false,
  };

  // Iterate over each tab (e.g., "entry", "reports")
  for (const tabKey in template) {
    if (template.hasOwnProperty(tabKey)) {
      schema.properties[tabKey] = {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      };
      const tab = template[tabKey];

      // Iterate over each section
      for (const sectionKey in tab.sections) {
        if (tab.sections.hasOwnProperty(sectionKey)) {
          const section = tab.sections[sectionKey];
          if (section.aiSkip) continue;

          // Iterate over each field in the section
          for (const fieldKey in section.fields) {
            if (section.fields.hasOwnProperty(fieldKey)) {
              const field = section.fields[fieldKey];

              // skip if
              if (field.interimHidden || field.disabled || field.aiSkip) continue;

              // Construct the "sectionname_fieldname" key
              const fieldId = `${sectionKey}_${fieldKey}`;

              // Create the schema for the field
              const fieldSchema: any = {
                type: "string",
              };

              //if a description exists, add it to the schema
              if (allowDescriptions && field.description) {
                fieldSchema.description = field.description;
              }

              // If there are options, add the enum
              if (field.options && Array.isArray(field.options) && field.options.length > 0) {
                //chatgpt does not allow \n in the enum values, loop over all values and escape any \n, JSON is happy with \\n to represent \n
                let fieldOptions = (field.options as string[]).map((option) => option.replace(/\n/g, "\\n"));
                //some options have a leading <_String_> that we need to remove, it is an indication for wha the shortform of the option is
                fieldOptions = fieldOptions.map((str) => str.replace(/^<.*?>/, ""));

                if (field.allowCreateOption) {
                  if (!fieldSchema.description) fieldSchema.description = "";
                  //add the options to the description as optional values
                  fieldSchema.description += " Choose one of these values if close: " + field.options.join(", ");
                } else {
                  //openai chatgpt does not like \n in the enum array, replace with double backslash n
                  const fieldOptions = (field.options as string[]).map((option) => option.replace(/\n/g, "\\n"));
                  //force the value to be one of the options
                  fieldSchema.enum = fieldOptions;
                }
              }

              if (allowDescriptions && currentFields && currentFields[fieldId]) {
                let currentDescriptionValue = currentFields[fieldId];
                if (true) {
                  currentDescriptionValue = "Default value: '" + currentFields[fieldId] + "'";
                } else {
                  currentDescriptionValue =
                    "The current value is the following, reuse this value if it is a perfect fit: '" + currentFields![fieldId] + "'";
                }
                fieldSchema.description ? (fieldSchema.description += " " + currentDescriptionValue) : (fieldSchema.description = currentDescriptionValue);
              }

              // Add this field to the properties of the schema
              schema.properties[tabKey].properties[fieldId] = fieldSchema;

              // Add the field to the required list (if required)
              schema.properties[tabKey].required.push(fieldId);
            }
          }
        }
      }
      schema.required.push(tabKey);
    }
  }

  return schema;
};

export const convertSchemaForAIResponseToString = (
  response: Record<string, any> | string,
  skipAltNewLineSymbolReplacement = false
): string | undefined => {
  if (typeof response === "object" && response?.choices && response.choices[0]?.message?.content) {
    response = response.choices[0].message.content;
  }

  if (typeof response === "string") {
    //json doesnt like \n in a json string, it will fail when parsed unless escaped
    const dataContent = response.replace(/\n/g, "\\n");
    //chatgpt doesnt like \n in the enum array, replace back the */n* with \n
    return skipAltNewLineSymbolReplacement ? dataContent : dataContent.replace(/\*\/n\*/g, "\n");
  } else {
    throw new Error("Invalid response data, did not find the expected content");
    return undefined;
  }
};
