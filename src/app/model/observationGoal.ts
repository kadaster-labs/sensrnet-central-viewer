import { Datastream } from './datastream';

export interface ObservationGoal {
  _id: string;

  name: string;
  description: string;
  legalGround: string;
  legalGroundLink: string;

  datastreams?: Datastream[];
}
