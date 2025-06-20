import Image from 'next/image';
import { useState } from 'react';

type Props = {
  onClick: () => void;
};

enum SelectedView {
  SORTBY = 'SORT_BY',
  LIST_VIEW = 'LIST_VIEW',
  CARD_VIEW = 'CARD_VIEW',
}

function SelectedCardView() {
  return (
    <Image
      height={16}
      width={16}
      className="cursor-pointer"
      src={'/svgs/sort/dark-grid-icon.svg'}
      alt="dark-grid-icon"
    />
  );
}

function SelectedListView() {
  return (
    <Image
      height={16}
      width={16}
      className="cursor-pointer"
      src={'/svgs/sort/dark-list-icon.svg'}
      alt="dark-list-icon"
    />
  );
}

function SelectedSortBy() {
  return (
    <Image
      height={16}
      width={64}
      className="cursor-pointer"
      src={'/svgs/sort/dark-sort-by-icon.svg'}
      alt="dark-sort-by-icon"
    />
  );
}

function SortBy(props: Props) {
  return (
    <Image
      height={16}
      width={64}
      className="cursor-pointer"
      src={'/svgs/sort/gray-sort-by-icon.svg'}
      alt="sort-by-icon"
      onClick={props.onClick}
    />
  );
}

function ListView(props: Props) {
  return (
    <Image
      height={16}
      width={16}
      className="cursor-pointer"
      src={'/svgs/sort/gray-list-icon.svg'}
      alt="list-icon"
      onClick={props.onClick}
    />
  );
}

function CardView(props: Props) {
  return (
    <Image
      height={16}
      width={16}
      className="cursor-pointer"
      src={'/svgs/sort/gray-grid-icon.svg'}
      alt="grid-icon"
      onClick={props.onClick}
    />
  );
}

export default function Sort() {
  const [selectedView, setSelectedView] = useState<SelectedView>(
    SelectedView.SORTBY,
  );

  const onClickListView = () => {
    setSelectedView(SelectedView.LIST_VIEW);
  };

  const onClickCardView = () => {
    setSelectedView(SelectedView.CARD_VIEW);
  };

  const onClickSortBy = () => {
    setSelectedView(SelectedView.SORTBY);
  };

  return (
    <div className="flex gap-x-2">
      {selectedView == SelectedView.SORTBY ? (
        <SelectedSortBy />
      ) : (
        <SortBy onClick={onClickSortBy} />
      )}
      {selectedView == SelectedView.LIST_VIEW ? (
        <SelectedListView />
      ) : (
        <ListView onClick={onClickListView} />
      )}
      {selectedView == SelectedView.CARD_VIEW ? (
        <SelectedCardView />
      ) : (
        <CardView onClick={onClickCardView} />
      )}
    </div>
  );
}
