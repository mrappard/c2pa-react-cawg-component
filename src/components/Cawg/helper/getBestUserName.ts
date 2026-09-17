

export type VerifiedIdentitiesObject = {
    "type": string,
    "name": string,
    "provider": {
        "id": string,
        "name": string
    },
    "verifiedAt": string
}

const changeTypeToNumber = (type: string): number => {
    switch (type) {
        case "cawg.document_verification":
            return 0;
        case "cawg.social_media":
            return 10;
        case "cawg.web_site":
            return 20;
        case "cawg.affiliation":
            return 1000000;
        default:
            return 100000;
    }
}

const typesToIgnore = ["cawg.affiliation"];


export const getBestUserName = (identityObjectArray: VerifiedIdentitiesObject[] | VerifiedIdentitiesObject, metaDataObject:{
    "dc:creator"?:string
}): string => {


    if (typeof identityObjectArray === "object" && !Array.isArray(identityObjectArray)) {
        identityObjectArray = [identityObjectArray];
    }
    
    if (!identityObjectArray || identityObjectArray.length === 0) {

        if (metaDataObject["dc:creator"]){
            return metaDataObject["dc:creator"]
        }



        return "Unknown";
    }

    

  const sortedArray = identityObjectArray.sort((a, b) => {
    return changeTypeToNumber(a.type) - changeTypeToNumber(b.type);
  })

  const headOfSortedArray = sortedArray[0];

  if (!headOfSortedArray) {
    return "Unknown";
  }

  if (typesToIgnore.includes(headOfSortedArray.type)) {
    return "Unknown";
  }

  return headOfSortedArray.name;

}