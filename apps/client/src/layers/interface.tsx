import { useEffect, useState } from "react";
import { GroupPlayersBlock } from "../components/groupPlayers";
import { Loader } from "../components/loader";
import { TopPlayersBlock } from "../components/topPlayers";
import { useScene } from "../hooks/useScene";

export const InterfaceLayer = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: { clientX: number; clientY: number }) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const scene = useScene();

  const showCommands = scene?.commands?.map((command) => (
    <p key={command} className="font-bold text-xl">
      {command}
    </p>
  ));

  const [sceneId, setSceneId] = useState<string>();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (sceneId === scene?.id) {
      return;
    }

    setSceneId(scene?.id);
    setShowLoader(true);

    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 5000);

    return () => clearInterval(timer);
  }, [scene?.id, sceneId]);

  const [showPlayersGroup, setShowPlayersGroup] = useState(false);

  useEffect(() => {
    scene?.group ? setShowPlayersGroup(true) : setShowPlayersGroup(false);
  }, [scene?.group]);

  return (
    <>
      <Loader isVisible={showLoader} />

      <div className="absolute z-10 bottom-0 left-0">
        {showPlayersGroup ? (
          <GroupPlayersBlock group={scene?.group} />
        ) : (
          <TopPlayersBlock />
        )}
      </div>

      <div className="relative">
        {/*<Village />*/}

        {/*<DealerBlock dealer={{ x: 520, y: 720 }} />*/}

        <div className="fixed top-4 left-4" style={{ zIndex: 1000 }}>
          <div className="w-72 h-auto px-4 py-4 text-amber-900 bg-amber-100 border-b-4 rounded-2xl">
            <div className="flex flex-row gap-1 items-start">
              <img
                src={"/discord.svg"}
                alt=""
                className="-ml-2 -mt-2 w-36 h-36"
              />

              <p className="font-semibold leading-tight">
                Есть идеи? Присоединяйся к нашему Discord серверу
              </p>
            </div>

            <p className="mt-3 font-semibold">Пиши команды в чат:</p>
            {showCommands}
          </div>

          <div className="text-sm text-amber-950">
            ({mousePos.x}, {mousePos.y})
          </div>
        </div>
      </div>

      <div className="fixed top-4 right-4" style={{ zIndex: 1000 }}>
        <pre className="text-white text-sm">
          {JSON.stringify(scene, undefined, 2)}
        </pre>
      </div>
    </>
  );
};
