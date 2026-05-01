import { Fragment } from "react";
import { Card } from "react-bootstrap";
import Link from "next/link";
import SpkBadge from "../general-reusable/reusable-uielements/spk-badge";

export type BasicFeatureItem = string | { value: string };

export interface SpkBasicPriceCardProps {
  price: {
    title?: string;
    price?: string;
    year?: string;
    percent?: string;
    btnColor?: string;
    priceColor?: string;
    badgeColor?: string;
    features: BasicFeatureItem[];
    titleColor?: string;
    planKey?: string;
    badge?: boolean;
  };
  cardClass?: string;
}

const SpkBasicPriceCard = ({ price, cardClass = "" }: SpkBasicPriceCardProps) => {
  const btnClass = `btn btn-lg btn-${price.btnColor} w-100`;
  const href = price.planKey ? `/onboarding?plan=${price.planKey}` : "#";

  return (
    <Fragment>
      <Card className={`custom-card ${cardClass}`} style={{ position: 'relative' }}>
        {price.badge && (
          <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold fs-12">
              ⭐ Más popular
            </span>
          </div>
        )}
        <Card.Body className="p-4 text-center">
          <h5 className={`fw-semibold mb-3 ${price.titleColor}`}>{price.title}</h5>
          <div className="d-flex align-items-end justify-content-center gap-1 mb-4">
            <h2 className={`fw-semibold mb-0 lh-1 text-${price.priceColor}`}>{price.price}</h2>
            <span className="fs-13">/ {price.year}</span>
          </div>
          <ul className="list-unstyled pricing-features-list-1 mx-5 text-start mb-4">
            {price.features.map((item, index) => (
              <li key={index}>
                {typeof item === "string" ? item : item.value}
              </li>
            ))}
          </ul>
          <div>
            <SpkBadge variant="" Customclass={`bg-${price.badgeColor}-transparent py-1 px-3 fs-13 rounded-pill fw-normal`}>
              {price.percent} Dscto
            </SpkBadge>
            <div className="d-grid mt-3">
              <Link href={href} className={btnClass}>Elegir Plan</Link>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Fragment>
  );
};

export default SpkBasicPriceCard;
