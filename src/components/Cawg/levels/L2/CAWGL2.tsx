import { CAWG_Header } from "../../CAWG_Header";
import { Manifest } from "../../../../types";
import "../styles/cawg.css";

export interface CAWGL2Props {
  manifest: Manifest;
  moreInfo?: () => void;
}

export default function CAWGL2({
  manifest,
  moreInfo
}: CAWGL2Props) {

  const title = manifest.title;
  const claimGenerator = manifest.claimGenerator?manifest.claimGenerator:manifest.claimGeneratorInfo?.[0]?.name??"Unknown Claim Generator";
  const claimGeneratorInitials = claimGenerator ? claimGenerator.split(" ").map((n) => n[0].toUpperCase()).join("") : "UCG";
  const publisher = manifest.assertions?.["stds.schema-org.CreativeWork"]?.publisher;
  const publisherName = Array.isArray(publisher) ? publisher.map((p) => p.name).join(", ") : publisher?.name;

  const author = manifest.assertions?.["stds.schema-org.CreativeWork"]?.author;
  const authorName = Array.isArray(author) ? author.map((a) => a.name).join(", ") : author?.name;
  
  return (
     <div className="cawg-card">
      <CAWG_Header />
      <div className="cawg-container">
        {
          manifest.thumbnail ? (
            <img src={manifest.thumbnail} alt="Thumbnail" className="cawg-thumbnail" />
          ) : (
            <div className="cawg-square">
              <span className="cawg-logo-text">{claimGeneratorInitials}</span>
            </div>
          )
        }

        <div className="flex flex-col">
          <div>
            <span className="cawg-media-title">{title}</span>
          </div>
          <div>
            <span className="cawg-claim-generator">{claimGenerator}</span>
          </div>
        </div>
      </div>
      
      {publisherName && <div className="cawg-key-value">
        <div className="cawg-key-value-label">Publisher</div>
        <div>{publisherName}</div>
      </div>}
      
      {authorName && <div className="cawg-key-value">
        <div className="cawg-key-value-label">Author</div>
        <div>{authorName}</div>
      </div>}

      {moreInfo && <div style={{ marginTop: 16 }}>
        <button onClick={moreInfo} className="cawg-button">
          More Info
        </button>
      </div>}
    </div>
  );
}
